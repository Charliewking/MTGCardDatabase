using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using MTGCardDatabase.Models;
using MTGDatabase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGCardDatabase.Controllers
{
    [Produces("application/json")]
    [Route("api/player")]
    public class PlayerController : Controller
    {
        private readonly WebConfiguration _config;
        private readonly TableContinuationToken token = null;

        public IActionResult Index()
        {
            return View();
        }

        public PlayerController(IOptions<WebConfiguration> config)
        {
            _config = config.Value;
        }

        [HttpGet]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        [Route("")]
        public async Task<IActionResult> GetAllPlayers()
        {
            var returnValue = await GetCloudTable(_config.playerTableName).ExecuteQuerySegmentedAsync(new TableQuery<PlayerEntity>(), token);

            return Ok(returnValue.ToList());
        }

        private CloudTable GetCloudTable(string tableName)
        {
            return GetStorageAccount().CreateCloudTableClient().GetTableReference(tableName);
        }

        private CloudStorageAccount GetStorageAccount()
        {
            return CloudStorageAccount.Parse(_config.mtgdatabaseConnectionString);
        }
    }
}
