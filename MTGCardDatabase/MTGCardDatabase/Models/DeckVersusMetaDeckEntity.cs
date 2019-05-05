using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGCardDatabase.Models
{
    public class DeckVersusMetaDeckEntity : TableEntity
    {
        public DeckVersusMetaDeckEntity(string owner_Deck, string metaDeckName)
        {
            this.PartitionKey = owner_Deck;
            this.RowKey = metaDeckName;
        }
        public DeckVersusMetaDeckEntity() { }
        public string DeckOwner { get; set; }
        public string DeckName { get; set; }
        public string MetaDeckName { get; set; }
        public int Bo1Wins { get; set; }
        public int Bo1Losses { get; set; }
        public int Bo3Wins { get; set; }
        public int Bo3Losses { get; set; }
        public float Bo1WinPercentage { get; set; }
        public float Bo3WinPercentage { get; set; }
        public bool Active { get; set; }
    }
}
