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
        private TableContinuationToken token;
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
            TableQuerySegment<CardEntity> returnValue = await GetCloudTable(_config.cardTableName).ExecuteQuerySegmentedAsync(new TableQuery<CardEntity>().Take(100), token);

            CollectionReturnObject returnObject = new CollectionReturnObject
            {
                ReturnList = returnValue.ToList(),
                Token = returnValue.ContinuationToken
            };

            return Ok(returnObject);
        }

        [Route("next")]
        public async Task<IActionResult> GetNextPage([FromBody]TokenEntity tokenString)
        {
            TableContinuationToken contToken = new TableContinuationToken
            {
                NextPartitionKey = tokenString.NextPartitionKey,
                NextRowKey = tokenString.NextRowKey,
                NextTableName = tokenString.NextTableName,
                TargetLocation = tokenString.targetLocation
            };


            var returnValue = await GetCloudTable(_config.cardTableName).ExecuteQuerySegmentedAsync(new TableQuery<CardEntity>().Take(100), contToken);

            CollectionReturnObject returnObject = new CollectionReturnObject
            {
                ReturnList = returnValue.ToList(),
                Token = returnValue.ContinuationToken
            };

            return Ok(returnObject);
        }

        [HttpGet]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        [Route("{filter}")]
        public async Task<IActionResult> GetAllCards([FromRoute]string filter)
        {
            TableQuery<CardEntity> query = new TableQuery<CardEntity>().Where(TableQuery.GenerateFilterCondition("Color1", QueryComparisons.Equal, filter));

            var returnValue = await GetCloudTable(_config.cardTableName).ExecuteQuerySegmentedAsync(query, token);

            return Ok(returnValue.ToList());
        }

        [HttpGet]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        [Route("preview/{setName}")]
        public async Task<IActionResult> GetAllPreviewCards([FromRoute]string setName)
        {
            // TODO Add Filter for 

            TableQuerySegment<PreviewCard> returnValue = await GetCloudTable(_config.previewTableName)
                .ExecuteQuerySegmentedAsync(new TableQuery<PreviewCard>()
                .Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, setName.ToLower())), token);

            return Ok(returnValue.ToList());
        }

        [HttpPost]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        [Route("preview")]
        public async Task SetPreviewCard([FromBody]PreviewCard card)
        {
            //TableQuerySegment<PreviewCard> returnValue = await GetCloudTable(_config.previewTableName).ExecuteQuerySegmentedAsync(new TableQuery<PreviewCard>(), token);

            //PreviewCard previewCard = await RetrievePreviewCard(card, _config.previewTableName);

            card.PartitionKey = card.Set;
            card.RowKey = card.Name.Replace(" // ", " ");

            try
            {
                await GetCloudTable(_config.previewTableName).ExecuteAsync(TableOperation.InsertOrReplace(card));
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
            }
        }

        [HttpGet]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        [Route("{colorFilter}/{textFilter}")]
        public async Task<IActionResult> GetAllCards([FromRoute]string colorFilter, [FromRoute]string textFilter)
        {
            TableQuery<CardEntity> query = new TableQuery<CardEntity>().Where(TableQuery.GenerateFilterCondition("Color1", QueryComparisons.Equal, colorFilter));
            //TableQuery<CardEntity> cardTextQuery = new TableQuery<CardEntity>().Where(TableQuery.GenerateFilterCondition("Card_Text", Queryable.Contains<>, textFilter));
            TableQuery<CardEntity> cardNameQuery = new TableQuery<CardEntity>().Where(TableQuery.GenerateFilterCondition("Name", QueryComparisons.Equal, textFilter));
            TableQuery<CardEntity> cardTypeQuery = new TableQuery<CardEntity>().Where(TableQuery.GenerateFilterCondition("Type_Line", QueryComparisons.Equal, textFilter));


            if (colorFilter == "X")
            {
                // Does not use color at all
            }
            else
            {
                // Uses Color and everything else
            }


            var returnValue = await GetCloudTable(_config.cardTableName).ExecuteQuerySegmentedAsync(query, token);

            return Ok(returnValue.ToList());
        }

        [Route("value")]
        public async Task<IActionResult> GetCollectionValue()
        {
            var returnValue = await GetCloudTable(_config.cardTableName).ExecuteQuerySegmentedAsync(new TableQuery<CardEntity>(), token);

            float collectionValue = 0;

            foreach (CardEntity card in returnValue.Results)
            {
                try
                {
                    collectionValue += (float.Parse(card.Price) * card.NumberInCollection);
                }
                catch
                {
                    continue;
                }
            }

            return Ok(Math.Round(collectionValue,2));
        }


        [Route("addCard/{count}")]
        public async Task AddNewCard([FromRoute]int count, [FromBody]CardEntity card)
        {
            card.PartitionKey = card.Set_Short;
            card.RowKey = card.Name.Replace(" // ", " ");
            card.NumberInCollection = count;
            try
            {
                await GetCloudTable(_config.cardTableName).ExecuteAsync(TableOperation.Insert(card));
            }
            catch(Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
            }
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
        }

        private async Task<CardEntity> RetrieveCard(CardEntity Card, string tableName)
        {
            TableResult retrievedCard = await GetCloudTable(tableName).ExecuteAsync(TableOperation.Retrieve<CardEntity>(Card.PartitionKey, Card.RowKey.Replace(" // ", " "))).ConfigureAwait(true);

            return (CardEntity)retrievedCard.Result;
        }

        private async Task<PreviewCard> RetrievePreviewCard(PreviewCard Card, string tableName)
        {
            TableResult retrievedPreviewCard = await GetCloudTable(tableName).ExecuteAsync(TableOperation.Retrieve<PreviewCard>(Card.PartitionKey, Card.RowKey.Replace(" // ", " "))).ConfigureAwait(true);

            return (PreviewCard)retrievedPreviewCard.Result;
        }
    }
}