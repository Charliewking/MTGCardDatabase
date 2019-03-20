using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGDatabase.Models
{
    public class CardEntity : TableEntity
    {
        public CardEntity(string cardSet, string cardName)
        {
            this.PartitionKey = cardSet;
            this.RowKey = cardName;
        }

        public CardEntity() { }
        public string name { get; set; }
        public string color1 { get; set; }
        public string color2 { get; set; }
        public string color3 { get; set; }
        public string rarity { get; set; }
        public string convertedCost { get; set; }
        public int numberInCollection { get; set; }
    }
}
