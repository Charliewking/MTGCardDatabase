using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using MTGDatabase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGCardDatabase.Controllers
{
    [Produces("application/json")]
    [Route("api/cube")]
    public class CubeController : Controller
    {
        private readonly WebConfiguration _config;
        private readonly TableContinuationToken token = null;
        //private TableStorageUtility _utility;

        public IActionResult Index()
        {
            return View();
        }

        public CubeController(IOptions<WebConfiguration> config)  //, TableStorageUtility utility
        {
            _config = config.Value;
            // _utility = utility;
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
    }
}
