using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGCardDatabase.Models
{
    public class MetaDeckEntity : TableEntity
    {
        public MetaDeckEntity(string metaDeckName)
        {
            this.PartitionKey = "MetaDeck";
            this.RowKey = metaDeckName;
        }

        public MetaDeckEntity() { }

        public string DeckTypeName { get; set; }
        public int Bo1Wins { get; set; }
        public int Bo1Losses { get; set; }
        public int Bo3Wins { get; set; }
        public int Bo3Losses { get; set; }
        public float Bo1WinPercentage { get; set; }
        public float Bo3WinPercentage { get; set; }
        public bool Active { get; set; }
    }
}
