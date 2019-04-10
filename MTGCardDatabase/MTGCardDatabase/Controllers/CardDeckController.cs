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
        private readonly string DeckCardTable = "deckcard";

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

            CloudTable table = GetStorageTable(DeckCardTable);
            TableContinuationToken token = null;

            TableQuery<DeckCardEntity> query = new TableQuery<DeckCardEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, Player_Deck));

            var returnValue = await table.ExecuteQuerySegmentedAsync(query, token);

            return Ok(returnValue.ToList());
        }

        [Route("addCardToDeck")]
        public async Task AddCardToDeck([FromBody]DeckCardEntity deckCard)
        {
            CloudTable table = GetStorageTable(_config.deckCardTableName);
            await UpdateCubeStats(deckCard);

            await table.ExecuteAsync(TableOperation.Insert(deckCard));
        }

        public async Task UpdateCubeStats(DeckCardEntity deckCard)
        {
            CloudTable table = GetStorageTable(_config.cubeStats);

            TableResult retrieved = await table.ExecuteAsync(TableOperation.Retrieve<DeckStatsEntity>("Stats", deckCard.PartitionKey)).ConfigureAwait(true);

            DeckStatsEntity stats = (DeckStatsEntity)retrieved.Result;

            if (stats != null)
            {
                CardEntity card = await GetCardDetails(deckCard).ConfigureAwait(true);
                if (card.Color1 == "R" && card.Color2 == " " ) { stats.RedCards++; }
                if (card.Color1 == "U" && card.Color2 == " ") { stats.BlueCards++; }
                if (card.Color1 == "G" && card.Color2 == " ") { stats.GreenCards++; }
                if (card.Color1 == "W" && card.Color2 == " ") { stats.WhiteCards++; }
                if (card.Color1 == "B" && card.Color2 == " ") { stats.BlackCards++; }
                if (card.Color1 == "G" && card.Color2 == "W")  { stats.GWCards++; }
                if (card.Color1 == "G" && card.Color2 == "R")  { stats.GRCards++; }
                if (card.Color1 == "G" && card.Color2 == "U")  { stats.UGCards++; }
                if (card.Color1 == "B" && card.Color2 == "G")  { stats.GBCards++; }
                if (card.Color1 == "R" && card.Color2 == "W")  { stats.WRCards++; }
                if (card.Color1 == "B" && card.Color2 == "W")  { stats.BWCards++; }
                if (card.Color1 == "U" && card.Color2 == "W")  { stats.UWCards++; }
                if (card.Color1 == "B" && card.Color2 == "U")  { stats.UBCards++; }
                if (card.Color1 == "R" && card.Color2 == "U")  { stats.URCards++; }
                if (card.Color1 == "B" && card.Color2 == "R")  { stats.RBCards++; }
                if (card.Type_Line.Contains("Artifact")){ stats.ArtifactCards++; }
                if (card.Type_Line.Contains("Land")){ stats.LandCards++; }
                if (card.Type_Line.Contains("Sorcery")){ stats.SorceryCount++; }
                if (card.Type_Line.Contains("Enchantment")){ stats.EnchantmentCount++; }
                if (card.Type_Line.Contains("Human")){ stats.HumanCount++; }
                if (card.Type_Line.Contains("Zombie")){ stats.ZombieCount++; }
                if (card.Type_Line.Contains("Wizard")){ stats.WizardCount++; }
                if (card.Type_Line.Contains("Shaman")){ stats.ShamanCount++; }
                if (card.Type_Line.Contains("Knight")){ stats.KnightCount++; }
                if (card.Type_Line.Contains("Creature")){ stats.CreatureCount++; }
                if (card.Type_Line.Contains("Instant")) { stats.InstantCount++; }

                await table.ExecuteAsync(TableOperation.Replace(stats));
            }
        }

        public async Task<CardEntity> GetCardDetails(DeckCardEntity deckCard)
        {
            TableContinuationToken token = null;
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

        private CloudTable GetStorageTable(string tableName)
        {
            return (CloudStorageAccount.Parse(_config.mtgdatabaseConnectionString)).CreateCloudTableClient().GetTableReference(tableName);
        }
    }
}