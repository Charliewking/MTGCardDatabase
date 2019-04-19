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
            CloudStorageAccount account = GetStorageAccount();

            CloudTableClient client = account.CreateCloudTableClient();

            CloudTable table = client.GetTableReference("deck");

            TableQuery<DeckEntity> query = new TableQuery<DeckEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, PlayerName));

            var returnValue = await table.ExecuteQuerySegmentedAsync(query, token);

            return Ok(returnValue.ToList());
        }

        //[HttpPost]
        //[ProducesResponseType(typeof(string), 200)]
        //[ProducesResponseType(typeof(string), 400)]
        //[ProducesResponseType(typeof(string), 500)]
        [Route("addDeck")]
        public async Task AddNewDeck([FromBody]DeckEntity deck)
        {
            CloudTable table = GetStorageTable(_config.deckTableName);

            DeckEntity newDeck = new DeckEntity(deck.PartitionKey, deck.RowKey);
            newDeck.Name = deck.Name;

            await table.ExecuteAsync(TableOperation.Insert(newDeck));
        }

        [HttpGet]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        [Route("cards/{Player_Deck}")]
        public async Task<IActionResult> GetAllDeckCards([FromRoute] string Player_Deck)
        {
            //CloudStorageAccount account = GetStorageAccount();

            //CloudTableClient client = account.CreateCloudTableClient();

            // Get all DeckCards
            CloudTable deckCardTable = GetStorageTable(_config.deckCardTableName);
            TableContinuationToken token = null;
            TableQuery<DeckCardEntity> query = new TableQuery<DeckCardEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, Player_Deck));
            var returnValue = await deckCardTable.ExecuteQuerySegmentedAsync(query, token);

            //Get List of Card Entities for each from the Card Table
            List<CardEntity> deckList = new List<CardEntity>();
            CloudTable cardTable = GetStorageTable(_config.cardTableName);
            foreach (DeckCardEntity deckCard in returnValue)
            {
                TableQuery<CardEntity> finalQuery = new TableQuery<CardEntity>().Where(
                    TableQuery.CombineFilters(
                        TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, deckCard.CardSet.ToLower()),
                        TableOperators.And,
                        TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, deckCard.CardName)));

                TableQuerySegment <CardEntity> returnCard = await cardTable.ExecuteQuerySegmentedAsync(finalQuery, token);
                deckList.Add(returnCard.FirstOrDefault());
            }


            return Ok(deckList);
        }

        [HttpPost]
        [Route("deckTracker")]
        public async Task AddDeckTrackerRow([FromBody] DeckTrackerEntity deckTrackerEntry)
        {
            CloudTable table = GetStorageAccount().CreateCloudTableClient().GetTableReference(_config.deckTrackerTableName);
            await table.ExecuteAsync(TableOperation.Insert(deckTrackerEntry));
        }

        [HttpGet]
        [Route("deckTracker")]
        public async Task<IActionResult> AddDeckTrackerRow([FromRoute] DeckEntity deck)
        {
            CloudTable table = GetStorageAccount().CreateCloudTableClient().GetTableReference(_config.deckTrackerTableName);
            TableQuery<DeckEntity> query = new TableQuery<DeckEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, deck.Name));

            var returnValue = await table.ExecuteQuerySegmentedAsync(query, token);

            return Ok(returnValue.ToList());
        }

        private CloudStorageAccount GetStorageAccount()
        {
            return CloudStorageAccount.Parse(_config.mtgdatabaseConnectionString);
        }

        private CloudTable GetStorageTable(string tableName)
        {
            return (CloudStorageAccount.Parse(_config.mtgdatabaseConnectionString)).CreateCloudTableClient().GetTableReference(tableName);
        }
    }
}