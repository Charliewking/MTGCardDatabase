using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.Storage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MTGDatabase.Models;
using Microsoft.WindowsAzure.Storage.Table;
using MTGCardDatabase.Models;

namespace MTGDatabase.Controllers
{
    [Produces("application/json")]
    [Route("api/cards")]
    public class CardController : Controller
    {
        private readonly WebConfiguration _config;
        //private TableStorageUtility _utility;

        public IActionResult Index()
        {
            return View();
        }

        public CardController(IOptions<WebConfiguration> config)  //, TableStorageUtility utility
        {
            _config = config.Value;
           // _utility = utility;
        }

        [HttpGet]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        [Route("")]
        public async Task<IActionResult> GetAllCards()
        {
            CloudStorageAccount account = GetStorageAccount();

            CloudTableClient client = account.CreateCloudTableClient();

            CloudTable table = client.GetTableReference(_config.cardTableName);
            TableContinuationToken token = null;

            //TableQuery<CardEntity> query = new TableQuery<CardEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, "RNA"));

            //var returnValue = await table.ExecuteQuerySegmentedAsync(query, token);

            var returnValue = await table.ExecuteQuerySegmentedAsync(new TableQuery<CardEntity>().Take(20), token);

            return Ok(returnValue.ToList());
        }

        [HttpGet]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        [Route("{filter}")]
        public async Task<IActionResult> GetAllCards([FromRoute]string filter)
        {
            CloudStorageAccount account = GetStorageAccount();

            CloudTableClient client = account.CreateCloudTableClient();

            CloudTable table = client.GetTableReference(_config.cardTableName);
            TableContinuationToken token = null;

            TableQuery<CardEntity> query = new TableQuery<CardEntity>().Where(TableQuery.GenerateFilterCondition("Color1", QueryComparisons.Equal, filter));

            //var returnValue = await table.ExecuteQuerySegmentedAsync(query, token);

            var returnValue = await table.ExecuteQuerySegmentedAsync(query, token);

            return Ok(returnValue.ToList());
        }

        [Route("addCard")]
        public async Task AddNewCard([FromBody]CardEntity card)
        {
            card.PartitionKey = card.Set_Short;
            card.RowKey = card.Name.Replace(" // ", " ");

            CloudTable table = GetStorageAccount().CreateCloudTableClient().GetTableReference(_config.cardTableName);

            await table.ExecuteAsync(TableOperation.Insert(card));
        }

        [Route("removeCard")]
        public async Task RemoveCard([FromBody]CardEntity Card)
        {
            CardEntity deleteCard = await RetrieveCard(Card, _config.cardTableName);
            if (deleteCard != null)
            {
                await GetCloudTable(_config.cardTableName).ExecuteAsync(TableOperation.Delete(deleteCard));
            }
        }

        [Route("decrement")]
        public async Task DecrementCard([FromBody]CardEntity Card)
        {
            CardEntity decrementCard = await RetrieveCard(Card, _config.cardTableName);

            if (decrementCard != null)
            {
                decrementCard.NumberInCollection--;

                await GetCloudTable(_config.cardTableName).ExecuteAsync(TableOperation.Replace(decrementCard));
            }
        }

        [Route("increment")]
        public async Task IncrementCard([FromBody]CardEntity Card)
        {
            CardEntity decrementCard = await RetrieveCard(Card, _config.cardTableName);

            if (decrementCard != null)
            {
                decrementCard.NumberInCollection++;

                await GetCloudTable(_config.cardTableName).ExecuteAsync(TableOperation.Replace(decrementCard));
            }
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

        private async Task<CardEntity> RetrieveCard(CardEntity Card, string tableName)
        {
            TableResult retrievedCard = await GetCloudTable(tableName).ExecuteAsync(TableOperation.Retrieve<CardEntity>(Card.PartitionKey, Card.RowKey.Replace(" // ", " "))).ConfigureAwait(true);

            return (CardEntity)retrievedCard.Result;
        }
    }
}