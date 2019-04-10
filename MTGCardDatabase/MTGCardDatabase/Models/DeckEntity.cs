using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGDatabase.Models
{
    public class DeckEntity : TableEntity
    {
        public DeckEntity(string deckOwner, string deckName)
        {
            this.PartitionKey = deckOwner;
            this.RowKey = deckName;
        }

        public DeckEntity() { }
        public string Name { get; set; }
        public string Color1 { get; set; }
        public string Color2 { get; set; }
        public string Color3 { get; set; }
        public string Color4 { get; set; }
        public string Color5 { get; set; }
    }
}
