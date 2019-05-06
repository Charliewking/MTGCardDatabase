using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGCardDatabase.Models
{
    public class DeckTrackerEntity : TableEntity
    {
        public DeckTrackerEntity(string owner_Deck)
        {
            this.PartitionKey = owner_Deck;
            this.RowKey = new DateTime().ToString();
        }
        public DeckTrackerEntity() { }
        public string Owner { get; set; }
        public string DeckName { get; set; }
        public string PlayedAgainst { get; set; }
        public string Format { get; set; }
        public string Rank { get; set; }
        public string Result { get; set; }
        public string Notes { get; set; }
    }
}
