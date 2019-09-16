using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using MTGCardDatabase.Models;
using MTGDatabase.Models;

namespace MTGCardDatabase.Controllers
{
    [Produces("application/json")]
    [Route("api/deckcards")]
    public class CardDeckController : Controller
    {
        private readonly WebConfiguration _config;
        private readonly TableContinuationToken token = null;

        public IActionResult Index()
        {
            return View();
        }

        public CardDeckController(IOptions<WebConfiguration> config)
        {
            _config = config.Value;
        }

        [HttpGet]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        [Route("{Player_Deck}")]
        public async Task<IActionResult> GetAllDeckCards([FromRoute] string Player_Deck)
        {
            TableQuery<DeckCardEntity> query = new TableQuery<DeckCardEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, Player_Deck));

            var returnValue = await GetStorageTable(_config.deckCardTableName).ExecuteQuerySegmentedAsync(query, token);

            return Ok(returnValue.ToList());
        }

        [Route("addCardToDeck/{format}/{count}")]
        public async Task AddCardToDeck([FromBody]DeckCardEntity deckCard, [FromRoute]bool format, [FromRoute]int count)
        {
            deckCard = IsCountLimited(deckCard, format);

            deckCard.PartitionKey = deckCard.Owner + "_" + deckCard.DeckName;
            deckCard.RowKey = deckCard.CardName.Replace(" // ", " ");

            deckCard.NumberInDeck = count;

            try
            {
                await GetStorageTable(_config.deckCardTableName).ExecuteAsync(TableOperation.Insert(deckCard));
                await UpdateDeckStats(deckCard, true, count);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        [Route("addcardtosideboard/{format}/{count}")]
        public async Task AddCardToSideboard([FromBody]DeckCardEntity deckCard, [FromRoute]bool format, [FromRoute]int count)
        {
            deckCard = IsCountLimited(deckCard, format);

            deckCard.PartitionKey = deckCard.Owner + "_" + deckCard.DeckName;
            deckCard.RowKey = deckCard.CardName.Replace(" // ", " ");

            try
            {
                DeckCardEntity retrievedDeckCard = await RetrieveDeckCard(deckCard);
                retrievedDeckCard.NumberInSideboard = count;
                await GetCloudTable(_config.deckCardTableName).ExecuteAsync(TableOperation.Replace(retrievedDeckCard));
                deckCard = retrievedDeckCard;
            }
            catch
            {
                deckCard.NumberInSideboard = count;
                await GetStorageTable(_config.deckCardTableName).ExecuteAsync(TableOperation.Insert(deckCard));
            }
            finally
            {
                await UpdateSideboardStats(deckCard, true, count);
            }
        }

        [Route("increment")]
        public async Task IncrementDeckCard([FromBody]DeckCardEntity deckCard)
        {
            DeckCardEntity card = await RetrieveDeckCard(deckCard);

            if (card != null)
            {
                if ((card.NumberInDeck + card.NumberInSideboard < 4) || !card.CountLimited)
                {
                    card.NumberInDeck++;
                    await GetCloudTable(_config.deckCardTableName).ExecuteAsync(TableOperation.Replace(card));
                    await UpdateDeckStats(deckCard, true, 1);
                }
            }
        }
        [Route("incrementSideboard")]
        public async Task IncrementSideboard([FromBody]DeckCardEntity deckCard)
        {
            DeckCardEntity card = await RetrieveDeckCard(deckCard);

            if (card != null) {
                if ((card.NumberInDeck + card.NumberInSideboard < 4) || !card.CountLimited)
                {
                    card.NumberInSideboard++;
                    await GetCloudTable(_config.deckCardTableName).ExecuteAsync(TableOperation.Replace(card));
                    await UpdateSideboardStats(deckCard, true, 1);
                }
            }
        }
        [Route("decrement")]
        public async Task DecrementDeckCard([FromBody]DeckCardEntity deckCard)
        {
            DeckCardEntity card = await RetrieveDeckCard(deckCard);

            if (card != null)
            {
                card.NumberInDeck--;
                if (card.NumberInDeck == 0 && card.NumberInSideboard == 0)
                {
                    await GetCloudTable(_config.deckCardTableName).ExecuteAsync(TableOperation.Delete(card));
                }
                else
                {
                    await GetCloudTable(_config.deckCardTableName).ExecuteAsync(TableOperation.Replace(card));
                }
                await UpdateDeckStats(deckCard, false, 1);
            }
        }
        [Route("decrementSideboard")]
        public async Task DecrementSideboard([FromBody]DeckCardEntity deckCard)
        {
            DeckCardEntity card = await RetrieveDeckCard(deckCard);

            if (card != null)
            {
                card.NumberInSideboard--;
                if (card.NumberInDeck == 0 && card.NumberInSideboard == 0)
                {
                    await GetCloudTable(_config.deckCardTableName).ExecuteAsync(TableOperation.Delete(card));
                }
                else
                {
                    await GetCloudTable(_config.deckCardTableName).ExecuteAsync(TableOperation.Replace(card));
                }
                await UpdateSideboardStats(deckCard, false, 1);
            }
        }

        [Route("removeCardFromDeck")]
        public async Task RemoveCard([FromBody]DeckCardEntity Card)
        {
            DeckCardEntity deleteCard = await RetrieveDeckCard(Card);
            if (deleteCard != null)
            {
                await GetCloudTable(_config.deckCardTableName).ExecuteAsync(TableOperation.Delete(deleteCard));
                await UpdateDeckStats(deleteCard, false, 1);
            }
        }

        [Route("removeDeck")]
        public async Task RemoveDeck([FromBody]DeckEntity Deck)
        {
            string playerDeck = Deck.Owner + "_" + Deck.Name;

            //OkObjectResult cardsResult = (OkObjectResult)GetAllDeckCards(playerDeck).Result;

            //List<DeckCardEntity> deckCards = (List<DeckCardEntity>)cardsResult.Value;

            List<DeckCardEntity> deckCards = (List<DeckCardEntity>)((OkObjectResult)GetAllDeckCards(playerDeck).Result).Value;

            foreach (DeckCardEntity Card in deckCards)
            {
                DeckCardEntity deleteCard = await RetrieveDeckCard(Card);
                if (deleteCard != null)
                {
                    await GetCloudTable(_config.deckCardTableName).ExecuteAsync(TableOperation.Delete(deleteCard));
                    await UpdateDeckStats(deleteCard, false, 1);
                }
            }
        }

        private async Task UpdateDeckStats(DeckCardEntity card, bool add, int count)
        {
            CloudTable table = GetStorageTable(_config.deckTableName);
            TableResult retrieved = new TableResult();

            try
            {
                retrieved = await table.ExecuteAsync(TableOperation.Retrieve<DeckEntity>(card.Owner, card.DeckName)).ConfigureAwait(true);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
            }
            finally
            {


                DeckEntity stats = (DeckEntity)retrieved.Result;

                if (stats != null && add)
                {
                    stats.CardCount += count;
                    if (card.Color1 == "R" && card.Color2 == "") { stats.RedCards += count; }
                    if (card.Color1 == "U" && card.Color2 == "") { stats.BlueCards += count; }
                    if (card.Color1 == "G" && card.Color2 == "") { stats.GreenCards += count; }
                    if (card.Color1 == "W" && card.Color2 == "") { stats.WhiteCards += count; }
                    if (card.Color1 == "B" && card.Color2 == "") { stats.BlackCards += count; }
                    if (card.Color1 == "G" && card.Color2 == "W") { stats.GWCards += count; }
                    if (card.Color1 == "G" && card.Color2 == "R") { stats.GRCards += count; }
                    if (card.Color1 == "G" && card.Color2 == "U") { stats.UGCards += count; }
                    if (card.Color1 == "B" && card.Color2 == "G") { stats.GBCards += count; }
                    if (card.Color1 == "R" && card.Color2 == "W") { stats.WRCards += count; }
                    if (card.Color1 == "B" && card.Color2 == "W") { stats.BWCards += count; }
                    if (card.Color1 == "U" && card.Color2 == "W") { stats.UWCards += count; }
                    if (card.Color1 == "B" && card.Color2 == "U") { stats.UBCards += count; }
                    if (card.Color1 == "R" && card.Color2 == "U") { stats.URCards += count; }
                    if (card.Color1 == "B" && card.Color2 == "R") { stats.RBCards += count; }
                    if (card.Type_Line.Contains("Artifact")) { stats.ArtifactCards += count; }
                    if (card.Type_Line.Contains("Land")) { stats.LandCards += count; }
                    if (card.Type_Line.Contains("Sorcery")) { stats.SorceryCount += count; }
                    if (card.Type_Line.Contains("Enchantment")) { stats.EnchantmentCount += count; }
                    if (card.Type_Line.Contains("Human")) { stats.HumanCount += count; }
                    if (card.Type_Line.Contains("Zombie")) { stats.ZombieCount += count; }
                    if (card.Type_Line.Contains("Wizard")) { stats.WizardCount += count; }
                    if (card.Type_Line.Contains("Shaman")) { stats.ShamanCount += count; }
                    if (card.Type_Line.Contains("Knight")) { stats.KnightCount += count; }
                    if (card.Type_Line.Contains("Creature")) { stats.CreatureCount += count; }
                    if (card.Type_Line.Contains("Instant")) { stats.InstantCount += count; }
                }
                // Otherwise decrement the values
                else if (stats != null && stats.CardCount > 0)
                {
                    stats.CardCount -= count;
                    if (card.Color1 == "R" && card.Color2 == "") { stats.RedCards -= count; }
                    if (card.Color1 == "U" && card.Color2 == "") { stats.BlueCards -= count; }
                    if (card.Color1 == "G" && card.Color2 == "") { stats.GreenCards -= count; }
                    if (card.Color1 == "W" && card.Color2 == "") { stats.WhiteCards -= count; }
                    if (card.Color1 == "B" && card.Color2 == "") { stats.BlackCards -= count; }
                    if (card.Color1 == "G" && card.Color2 == "W") { stats.GWCards -= count; }
                    if (card.Color1 == "G" && card.Color2 == "R") { stats.GRCards -= count; }
                    if (card.Color1 == "G" && card.Color2 == "U") { stats.UGCards -= count; }
                    if (card.Color1 == "B" && card.Color2 == "G") { stats.GBCards -= count; }
                    if (card.Color1 == "R" && card.Color2 == "W") { stats.WRCards -= count; }
                    if (card.Color1 == "B" && card.Color2 == "W") { stats.BWCards -= count; }
                    if (card.Color1 == "U" && card.Color2 == "W") { stats.UWCards -= count; }
                    if (card.Color1 == "B" && card.Color2 == "U") { stats.UBCards -= count; }
                    if (card.Color1 == "R" && card.Color2 == "U") { stats.URCards -= count; }
                    if (card.Color1 == "B" && card.Color2 == "R") { stats.RBCards -= count; }
                    if (card.Type_Line.Contains("Artifact")) { stats.ArtifactCards -= count; }
                    if (card.Type_Line.Contains("Land")) { stats.LandCards -= count; }
                    if (card.Type_Line.Contains("Sorcery")) { stats.SorceryCount -= count; }
                    if (card.Type_Line.Contains("Enchantment")) { stats.EnchantmentCount -= count; }
                    if (card.Type_Line.Contains("Human")) { stats.HumanCount -= count; }
                    if (card.Type_Line.Contains("Zombie")) { stats.ZombieCount -= count; }
                    if (card.Type_Line.Contains("Wizard")) { stats.WizardCount -= count; }
                    if (card.Type_Line.Contains("Shaman")) { stats.ShamanCount -= count; }
                    if (card.Type_Line.Contains("Knight")) { stats.KnightCount -= count; }
                    if (card.Type_Line.Contains("Creature")) { stats.CreatureCount -= count; }
                    if (card.Type_Line.Contains("Instant")) { stats.InstantCount -= count; }
                }

                await table.ExecuteAsync(TableOperation.Replace(stats));
            }
        }

        private async Task UpdateSideboardStats(DeckCardEntity card, bool add, int count)
        {
            CloudTable table = GetStorageTable(_config.deckTableName);

            TableResult retrieved = await table.ExecuteAsync(TableOperation.Retrieve<DeckEntity>(card.Owner, card.DeckName)).ConfigureAwait(true);

            DeckEntity stats = (DeckEntity)retrieved.Result;

            if (stats != null && add)
            {
                stats.SideboardCount += count;
            }
            else if (stats != null && stats.SideboardCount > 0)
            {
                stats.SideboardCount -= count;
            }

            await table.ExecuteAsync(TableOperation.Replace(stats));
        }

        public async Task<CardEntity> GetCardDetails(DeckCardEntity deckCard)
        {
            //Get the Card Entity
            CloudTable cardTable = GetStorageTable(_config.cardTableName);

            TableQuery<CardEntity> finalQuery = new TableQuery<CardEntity>().Where(
                TableQuery.CombineFilters(
                    TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, deckCard.CardSet),
                    TableOperators.And,
                    TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, deckCard.CardName)));

            TableQuerySegment<CardEntity> returnCards = await cardTable.ExecuteQuerySegmentedAsync(finalQuery, token);
            CardEntity returnCard = returnCards.FirstOrDefault();

            return returnCard;
        }

        private CloudTable GetCloudTable(string tableName)
        {
            return GetStorageAccount().CreateCloudTableClient().GetTableReference(tableName);
        }

        private CloudStorageAccount GetStorageAccount()
        {
            return CloudStorageAccount.Parse(_config.mtgdatabaseConnectionString);

            //return _utility.GetStorageAccount();
        }

        private async Task<DeckCardEntity> RetrieveDeckCard(DeckCardEntity Card)
        {
            if (Card.PartitionKey == null || Card.RowKey == null)
            {
                Card.PartitionKey = Card.Owner + "_" + Card.DeckName;
                Card.RowKey = Card.CardName;
            }

            TableResult retrievedCard = await GetCloudTable(_config.deckCardTableName).ExecuteAsync(TableOperation.Retrieve<DeckCardEntity>(Card.PartitionKey, Card.RowKey)).ConfigureAwait(true);

            return (DeckCardEntity)retrievedCard.Result;
        }

        private async Task<CardEntity> RetrieveCard(DeckCardEntity Card)
        {
            TableResult retrievedCard = await GetCloudTable(_config.cardTableName).ExecuteAsync(TableOperation.Retrieve<CardEntity>(Card.CardSet, Card.RowKey)).ConfigureAwait(true);

            return (CardEntity)retrievedCard.Result;
        }

        private CloudTable GetStorageTable(string tableName)
        {
            return (CloudStorageAccount.Parse(_config.mtgdatabaseConnectionString)).CreateCloudTableClient().GetTableReference(tableName);
        }

        private DeckCardEntity IsCountLimited(DeckCardEntity deckCard, bool format)
        {
            if(!format || deckCard.CardName == "Mountain" || deckCard.CardName == "Plains" || deckCard.CardName == "Swamp" || deckCard.CardName == "Forest" || deckCard.CardName == "Island" || deckCard.CardName == "Rat Colony" || deckCard.CardName == "Persistent Petitioners")
            {
                deckCard.CountLimited = false;
            }
            else
            {
                deckCard.CountLimited = true;
            }

            return deckCard;
        }

    }
}