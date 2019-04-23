﻿using System;
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
            TableQuery<DeckEntity> query = new TableQuery<DeckEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, PlayerName));

            var returnValue = await GetStorageTable(_config.deckTableName).ExecuteQuerySegmentedAsync(query, token);

            return Ok(returnValue.ToList());
        }

        [HttpGet]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        [Route("deck/{PlayerName}/{DeckName}")]
        public async Task<IActionResult> GetAllDecks([FromRoute] string playerName, string deckName)
        {
            TableQuery<DeckEntity> finalQuery = new TableQuery<DeckEntity>().Where(
                TableQuery.CombineFilters(
                    TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, playerName),
                    TableOperators.And,
                    TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, deckName)));

            var returnValue = await GetStorageTable(_config.deckTableName).ExecuteQuerySegmentedAsync(finalQuery, token);

            return Ok(returnValue);
        }

        [HttpPost]
        //[ProducesResponseType(typeof(string), 200)]
        //[ProducesResponseType(typeof(string), 400)]
        //[ProducesResponseType(typeof(string), 500)]
        [Route("addDeck")]
        public async Task AddNewDeck([FromBody]DeckEntity deck)
        {
            DeckEntity newDeck = new DeckEntity(deck.PartitionKey, deck.RowKey);
            newDeck.Name = deck.Name;

            await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Insert(newDeck));
        }

        [HttpPost]
        [Route("RemoveDeck")]
        public async Task RemoveDeck([FromBody]DeckEntity deck)
        {
            await GetStorageTable(_config.deckTableName).ExecuteAsync(TableOperation.Delete(deck));

            TableResult result = await GetStorageTable(_config.cubeStats).ExecuteAsync(TableOperation.Retrieve<DeckStatsEntity>("Stats", deck.PartitionKey)).ConfigureAwait(true);
            DeckStatsEntity deckStatsRow = (DeckStatsEntity)result.Result;
            await GetStorageTable(_config.cubeStats).ExecuteAsync(TableOperation.Delete(deckStatsRow));
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