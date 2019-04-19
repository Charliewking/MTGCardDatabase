using Microsoft.Extensions.Options;
using Microsoft.WindowsAzure.Storage;
using MTGDatabase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGCardDatabase.Models
{
    public class TableStorageUtility
    {
        //private readonly WebConfiguration _config;

        //public TableStorageUtility(IOptions<WebConfiguration> config)
        //{
        //    _config = config.Value;
        //}

        //public CloudStorageAccount GetStorageAccount()
        //{
        //    return PrivateGetStorageAccount();
        //}

        //private CloudStorageAccount PrivateGetStorageAccount()
        //{
        //    return CloudStorageAccount.Parse(_config.mtgdatabaseConnectionString);
        //}
    }
}
