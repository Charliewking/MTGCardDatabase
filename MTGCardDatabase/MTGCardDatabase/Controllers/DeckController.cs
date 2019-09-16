using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using MTGCardDatabase.Controllers;
using MTGCardDatabase.Models;
using MTGDatabase.Models;

namespace MTGDatabase.Controllers
{
    [Produces("application/json")]
    [Route("api/decks")]
    public class DeckController : Controller
    {
        private readonly WebConfiguration _config;
        private readonly TableContinuationToken token = null;
        public IActionResult Index()
        {
            return View();
        }

        public DeckController(IOptions<WebConfiguration> config)
        {
            _config = config.Value;
        }

        [HttpGet]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        [Route("{PlayerName}")]
        public async Task<IActionResult> GetAllDecks([FromRoute] string PlayerName)
        {
            //List<DeckEntity> returnDecks = new List<DeckEntity>();

            TableQuery<DeckEntity> query = new TableQuery<DeckEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, PlayerName));

            var returnValue = await GetStorageTable(_config.deckTableName).ExecuteQuerySegmentedAsync(query, token);

            foreach (DeckEntity deck in returnValue.ToList())
            {
                string Player_Deck = PlayerName + "_" + deck.RowKey;

                TableQuery<DeckCardEntity> deckCardquery = new TableQuery<DeckCardEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, Player_Deck));

                var deckCards = await GetStorageTable(_config.deckCardTableName).ExecuteQuerySegmentedAsync(deckCardquery, token);

                List<DeckCardEntity> MainDeckTempList = new List<DeckCardEntity>();
                List<DeckCardEntity> SideboardTempList = new List<DeckCardEntity>();

                foreach (DeckCardEntity deckCard in deckCards.Results)
                {
                    if (deckCard.NumberInDeck > 0)
                    {
                        MainDeckTempList.Add(deckCard);
                    }
                    if(deckCard.NumberInSideboard > 0)
                    {
                        SideboardTempList.Add(deckCard);
                    }
                }

                deck.MainDeck = MainDeckTempList;
                deck.Sideboard = SideboardTempList;

                // Populate Deck Tracker Rows
                TableQuery<DeckTrackerEntity> deckTrackerquery = new TableQuery<DeckTrackerEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, Player_Deck));

                var trackerRows = await GetStorageTable(_config.deckTrackerTableName).ExecuteQuerySegmentedAsync(deckTrackerquery, token);

                deck.TrackerRows = trackerRows.ToList();
            }

            return Ok(returnValue.ToList());
        }

        [HttpGet]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        [Route("deck/{PlayerName}/{DeckName}")]
        public async Task<IActionResult> GetDeckCards([FromRoute] string playerName, string deckName)
        {
            DeckEntity deck = await getDeckCards(playerName, deckName);

            // Populate Deck Tracker Rows
            TableQuery<DeckTrackerEntity> deckTrackerquery = new TableQuery<DeckTrackerEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, playerName + "_" + deckName));

            var trackerRows = await GetStorageTable(_config.deckTrackerTableName).ExecuteQuerySegmentedAsync(deckTrackerquery, token);

            deck.TrackerRows = trackerRows.ToList();

            return Ok(deck);
        }


        [HttpPost]
        //[ProducesResponseType(typeof(string), 200)]
        //[ProducesResponseType(typeof(string), 400)]
        //[ProducesResponseType(typeof(string), 500)]
        [Route("addDeck")]
        public async Task AddNewDeck([FromBody]DeckEntity deck)
        {
            deck.PartitionKey = deck.Owner;
            deck.RowKey = deck.Name;

            await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Insert(deck));
        }

        [HttpPost]
        //[ProducesResponseType(typeof(string), 200)]
        //[ProducesResponseType(typeof(string), 400)]
        //[ProducesResponseType(typeof(string), 500)]
        [Route("duplicateDeck")]
        public async Task duplicateDeck([FromBody]DeckEntity deck)
        {
            TableResult result = await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Retrieve<DeckEntity>(deck.Owner, deck.RowKey)).ConfigureAwait(true);
            DeckEntity duplicateDeck = (DeckEntity)result.Result;

            duplicateDeck.RowKey = deck.RowKey + "-Copy";
            duplicateDeck.Name = deck.Name + "-Copy";

            await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Insert(duplicateDeck));
        }

        [HttpPost]
        //[ProducesResponseType(typeof(string), 200)]
        //[ProducesResponseType(typeof(string), 400)]
        //[ProducesResponseType(typeof(string), 500)]
        [Route("renameDeck/{newDeckName}")]
        public async Task renameDeck([FromBody]DeckEntity deck, [FromRoute]string newDeckName)
        {
            TableResult result = await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Retrieve<DeckEntity>(deck.PartitionKey, deck.RowKey)).ConfigureAwait(true);
            DeckEntity renameDeck = (DeckEntity)result.Result;

            renameDeck.Name = newDeckName;

            await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Replace(renameDeck));
        }


        [HttpPost]
        [Route("RemoveDeck")]
        public async Task RemoveDeck([FromBody]DeckEntity deck)
        {
            //await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Delete(deck));
            await RemoveDeckTrackerRow(deck);
            TableResult result = await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Retrieve<DeckEntity>(deck.Owner, deck.RowKey)).ConfigureAwait(true);
            DeckEntity removeDeck = (DeckEntity)result.Result;
            await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Delete(removeDeck));
        }

        [HttpGet]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        [Route("cards/{Player_Deck}")]
        public async Task<IActionResult> GetAllDeckCards([FromRoute] string Player_Deck)
        {
            // Get all DeckCards
            CloudTable deckCardTable = GetStorageTable(_config.deckCardTableName);
            TableContinuationToken token = null;
            TableQuery<DeckCardEntity> query = new TableQuery<DeckCardEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, Player_Deck));
            var returnValue = await deckCardTable.ExecuteQuerySegmentedAsync(query, token);

            return Ok(returnValue);

            //Get List of Card Entities for each from the Card Table
            //List<CardEntity> deckList = new List<CardEntity>();
            //CloudTable cardTable = GetStorageTable(_config.cardTableName);
            //foreach (DeckCardEntity deckCard in returnValue)
            //{
            //    TableQuery<CardEntity> finalQuery = new TableQuery<CardEntity>().Where(
            //        TableQuery.CombineFilters(
            //            TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, deckCard.CardSet.ToLower()),
            //            TableOperators.And,
            //            TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, deckCard.CardName)));

            //    TableQuerySegment <CardEntity> returnCard = await cardTable.ExecuteQuerySegmentedAsync(finalQuery, token);
            //    deckList.Add(returnCard.FirstOrDefault());
            //}
            //return Ok(deckList);
        }

        [HttpPost]
        [Route("deckTracker")]
        public async Task AddDeckTrackerRow([FromBody] DeckTrackerEntity deckTrackerEntry)
        {
            deckTrackerEntry.PartitionKey = deckTrackerEntry.Owner + "_" + deckTrackerEntry.DeckName;
            deckTrackerEntry.RowKey = DateTime.Now.ToLocalTime().ToString().Replace("/","-");

            // Add 1 to Games Played in DeckEntity, Check for DeckversusMeta Row/Increment or create, Update MetaDeckEntity

            TableResult varDeck = await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Retrieve<DeckEntity>(deckTrackerEntry.Owner, deckTrackerEntry.DeckName)).ConfigureAwait(true);
            DeckEntity returnDeck = (DeckEntity)varDeck.Result;

            TableResult varMetaDeck = await GetStorageTable(_config.metaDecksTableName).ExecuteAsync(TableOperation.Retrieve<MetaDeckEntity>("MetaDeck", deckTrackerEntry.PlayedAgainst.Replace(" ",""))).ConfigureAwait(true);
            MetaDeckEntity returnMetaDeck = (MetaDeckEntity)varMetaDeck.Result;

            TableResult varDeckVersusMetaDeck = await GetStorageTable(_config.deckVersusMetaDeckTable).ExecuteAsync(TableOperation.Retrieve<DeckVersusMetaDeckEntity>(deckTrackerEntry.Owner + "_" + deckTrackerEntry.DeckName, deckTrackerEntry.PlayedAgainst)).ConfigureAwait(true);
            DeckVersusMetaDeckEntity returnDeckVersusMetaDeck = (DeckVersusMetaDeckEntity)varDeckVersusMetaDeck.Result;

            TableResult varPlayer = await GetStorageTable(_config.playerTableName).ExecuteAsync(TableOperation.Retrieve<PlayerEntity>("Player", deckTrackerEntry.Owner)).ConfigureAwait(true);
            PlayerEntity returnPlayer = (PlayerEntity)varPlayer.Result;

            if (returnDeckVersusMetaDeck == null) {
                DeckVersusMetaDeckEntity newDeckVersusMetaDeck = new DeckVersusMetaDeckEntity
                {
                    PartitionKey = deckTrackerEntry.Owner + "_" + deckTrackerEntry.DeckName,
                    RowKey = deckTrackerEntry.PlayedAgainst,
                    MetaDeckName = deckTrackerEntry.PlayedAgainst
                };
                await GetStorageTable(_config.deckVersusMetaDeckTable).ExecuteAsync(TableOperation.Insert(newDeckVersusMetaDeck));
            }

            varDeckVersusMetaDeck = await GetStorageTable(_config.deckVersusMetaDeckTable).ExecuteAsync(TableOperation.Retrieve<DeckVersusMetaDeckEntity>(deckTrackerEntry.Owner + "_" + deckTrackerEntry.DeckName, deckTrackerEntry.PlayedAgainst)).ConfigureAwait(true);
            returnDeckVersusMetaDeck = (DeckVersusMetaDeckEntity)varDeckVersusMetaDeck.Result;


            if (deckTrackerEntry.Format == "Bo3") {
                returnDeck.Bo3Played++;
                if (deckTrackerEntry.Result == "Win" ) { returnDeck.Bo3Wins++; returnMetaDeck.Bo3Wins++; returnDeckVersusMetaDeck.Bo3Wins++; returnPlayer.Bo3Wins++; }
                else { returnDeck.Bo3Losses++; returnMetaDeck.Bo3Losses++; returnDeckVersusMetaDeck.Bo3Losses++; returnPlayer.Bo3Losses++;  }
            } else {
                returnDeck.Bo1Played++;
                if (deckTrackerEntry.Result == "Win") { returnDeck.Bo1Wins++; returnMetaDeck.Bo1Wins++; returnDeckVersusMetaDeck.Bo1Wins++; returnPlayer.Bo1Wins++; }
                else { returnDeck.Bo1Losses++; returnMetaDeck.Bo1Losses++; returnDeckVersusMetaDeck.Bo1Losses++; returnPlayer.Bo1Losses++; }
            }


            await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Replace(returnDeck));
            await GetStorageTable(_config.metaDecksTableName).ExecuteAsync(TableOperation.Replace(returnMetaDeck));
            await GetStorageTable(_config.deckVersusMetaDeckTable).ExecuteAsync(TableOperation.Replace(returnDeckVersusMetaDeck));
            await GetStorageTable(_config.playerTableName).ExecuteAsync(TableOperation.Replace(returnPlayer));
            await GetStorageTable(_config.deckTrackerTableName).ExecuteAsync(TableOperation.Insert(deckTrackerEntry));
        }

        [HttpPost]
        [Route("addNotes")]
        public async Task AddDeckNotes ([FromBody] DeckEntity deck)
        {
            //TableResult varDeck = await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Retrieve<DeckEntity>(deck.PartitionKey, deck.RowKey)).ConfigureAwait(true);
            //DeckEntity returnDeck = (DeckEntity)varDeck.Result;
            await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Replace(deck));
        }

        private async Task RemoveDeckTrackerRow(DeckEntity deck)
        {
            CloudTable table = GetStorageAccount().CreateCloudTableClient().GetTableReference(_config.deckTrackerTableName);
            TableQuery<DeckEntity> query = new TableQuery<DeckEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, deck.RowKey));

            var returnValue = await table.ExecuteQuerySegmentedAsync(query, token);

            var deleteList = returnValue.ToList();
            foreach(DeckEntity deleteDeck in deleteList)
            {
                await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Delete(deleteDeck));
            }
        }

        [HttpGet]
        [Route("deckTracker")]
        public async Task<IActionResult> GetDeckTrackerRow([FromRoute] DeckEntity deck)
        {
            CloudTable table = GetStorageAccount().CreateCloudTableClient().GetTableReference(_config.deckTrackerTableName);
            TableQuery<DeckEntity> query = new TableQuery<DeckEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, deck.RowKey));

            var returnValue = await table.ExecuteQuerySegmentedAsync(query, token);

            return Ok(returnValue.ToList());
        }

        [HttpGet]
        [Route("metaDecks")]
        public async Task<IActionResult> GetMetaDecks()
        {
            var returnValue = await GetStorageTable(_config.metaDecksTableName).ExecuteQuerySegmentedAsync(new TableQuery<MetaDeckEntity>(), token);

            return Ok(returnValue.ToList());
        }

        [HttpPost]
        [Route("metaDecks")]
        public async Task AddMetaDeck([FromBody] MetaDeckEntity metaDeck)
        {
            metaDeck.PartitionKey = "MetaDeck";
            metaDeck.RowKey = metaDeck.DeckTypeName.Replace(" ", "");


            await GetStorageTable(_config.metaDecksTableName).ExecuteAsync(TableOperation.Insert(metaDeck));
        }

        [HttpGet]
        [Route("randomHand/{playerName}/{deckname}")]
        public async Task<IActionResult> GenerateRandomHand([FromRoute] string playerName, [FromRoute] string deckName)
        {
            List<DeckCardEntity> deckRepresentation = new List<DeckCardEntity>();
            List<DeckCardEntity> handRepresentation = new List<DeckCardEntity>();

            DeckEntity deck = await getDeckCards(playerName, deckName);

            foreach (DeckCardEntity card in deck.MainDeck)
            {
                for (int i = 0; i < card.NumberInDeck; i++){
                    deckRepresentation.Add(card);
                }
            }

            Random random = new Random();
            int randomInt = 0;

            for (int j = 0; j < 7; j++)
            {
                randomInt = random.Next(0, deckRepresentation.Count);

                DeckCardEntity newCard = deckRepresentation.ElementAt(randomInt);
                deckRepresentation.RemoveAt(randomInt);

                handRepresentation.Add(newCard);
            }

            return Ok(handRepresentation);
        }

        private CloudStorageAccount GetStorageAccount()
        {
            return CloudStorageAccount.Parse(_config.mtgdatabaseConnectionString);
        }

        private CloudTable GetStorageTable(string tableName)
        {
            return (CloudStorageAccount.Parse(_config.mtgdatabaseConnectionString)).CreateCloudTableClient().GetTableReference(tableName);
        }

        private async Task<DeckEntity> getDeckCards(string playerName, string deckName)
        {
            TableQuery<DeckEntity> deckQuery = new TableQuery<DeckEntity>().Where(
            TableQuery.CombineFilters(
            TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, playerName),
            TableOperators.And,
            TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, deckName)));

            var returnValue = await GetStorageTable(_config.deckTableName).ExecuteQuerySegmentedAsync(deckQuery, token);
            DeckEntity deck = returnValue.FirstOrDefault();

            string Player_Deck = playerName + "_" + deckName;

            TableQuery<DeckCardEntity> deckCardquery = new TableQuery<DeckCardEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, Player_Deck));

            var deckCards = await GetStorageTable(_config.deckCardTableName).ExecuteQuerySegmentedAsync(deckCardquery, token);

            List<DeckCardEntity> MainDeckTempList = new List<DeckCardEntity>();
            List<DeckCardEntity> SideboardTempList = new List<DeckCardEntity>();

            foreach (DeckCardEntity deckCard in deckCards.Results)
            {
                if (deckCard.NumberInDeck > 0)
                {
                    MainDeckTempList.Add(deckCard);
                }
                if (deckCard.NumberInSideboard > 0)
                {
                    SideboardTempList.Add(deckCard);
                }
            }

            deck.MainDeck = MainDeckTempList;
            deck.Sideboard = SideboardTempList;

            return deck;
        }
    }
}