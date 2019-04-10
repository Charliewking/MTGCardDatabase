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

namespace MTGDatabase.Controllers
{
    [Produces("application/json")]
    [Route("api/cards")]
    public class CardController : Controller
    {
        private readonly WebConfiguration _config;
        private readonly string TableName = "cardthree";

        public IActionResult Index()
        {
            return View();
        }

        public CardController(IOptions<WebConfiguration> config)
        {
            _config = config.Value;
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

            CloudTable table = client.GetTableReference(TableName);
            TableContinuationToken token = null;

            //TableQuery<CardEntity> query = new TableQuery<CardEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, "RNA"));

            //var returnValue = await table.ExecuteQuerySegmentedAsync(query, token);

            var returnValue = await table.ExecuteQuerySegmentedAsync(new TableQuery<CardEntity>(), token);

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

            CloudTable table = client.GetTableReference(TableName);
            TableContinuationToken token = null;

            TableQuery<CardEntity> query = new TableQuery<CardEntity>().Where(TableQuery.GenerateFilterCondition("Color1", QueryComparisons.Equal, filter));

            //var returnValue = await table.ExecuteQuerySegmentedAsync(query, token);

            var returnValue = await table.ExecuteQuerySegmentedAsync(query, token);

            return Ok(returnValue.ToList());
        }

        [Route("addCard")]
        public async Task AddNewCard([FromBody]CardEntity card)
        {
            CloudTable table = GetStorageAccount().CreateCloudTableClient().GetTableReference(TableName);

            //CardEntity newCard = new CardEntity(card.PartitionKey, card.RowKey);
            //newCard.name = card.name;
            //newCard.color1 = card.color1;
            //newCard.color2 = card.color2;
            //newCard.convertedCost = card.convertedCost;
            //newCard.rarity = card.rarity;
            //newCard.numberInCollection = card.numberInCollection;

            await table.ExecuteAsync(TableOperation.Insert(card));
        }

        [Route("removeCard")]
        public async Task RemoveCard([FromBody]CardEntity Card)
        {
            CloudTable table = GetStorageAccount().CreateCloudTableClient().GetTableReference(TableName);

            TableResult retrievedCard = await table.ExecuteAsync(TableOperation.Retrieve<CardEntity>(Card.PartitionKey, Card.RowKey)).ConfigureAwait(true);

            CardEntity deleteCard = (CardEntity)retrievedCard.Result;
            if (deleteCard != null)
            {
                await table.ExecuteAsync(TableOperation.Delete(deleteCard));
            }
        }

        [Route("decrement")]
        public async Task DecrementCard([FromBody]CardEntity Card)
        {
            CloudTable table = GetStorageAccount().CreateCloudTableClient().GetTableReference(TableName);

            TableResult retrievedCard = await table.ExecuteAsync(TableOperation.Retrieve<CardEntity>(Card.PartitionKey, Card.RowKey)).ConfigureAwait(true);

            CardEntity decrementCard = (CardEntity)retrievedCard.Result;

            if(decrementCard != null)
            {
                decrementCard.NumberInCollection--;

                await table.ExecuteAsync(TableOperation.Replace(decrementCard));
            }
        }

        [Route("increment")]
        public async Task IncrementCard([FromBody]CardEntity Card)
        {
            CloudTable table = GetStorageAccount().CreateCloudTableClient().GetTableReference(TableName);

            TableResult retrievedCard = await table.ExecuteAsync(TableOperation.Retrieve<CardEntity>(Card.PartitionKey, Card.RowKey)).ConfigureAwait(true);

            CardEntity decrementCard = (CardEntity)retrievedCard.Result;

            if (decrementCard != null)
            {
                decrementCard.NumberInCollection++;

                await table.ExecuteAsync(TableOperation.Replace(decrementCard));
            }
        }

        private CloudStorageAccount GetStorageAccount()
        {
            return CloudStorageAccount.Parse(_config.mtgdatabaseConnectionString);
        }
    }
}