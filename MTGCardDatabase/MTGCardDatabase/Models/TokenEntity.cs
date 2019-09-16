using Microsoft.WindowsAzure.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGCardDatabase.Models
{
    public class TokenEntity
    {
        public string NextPartitionKey { get; set; }
        public string NextRowKey { get; set; }
        public string NextTableName { get; set; }
        public StorageLocation targetLocation { get; set; }
    }
}
