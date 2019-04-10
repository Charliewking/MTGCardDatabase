using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGCardDatabase.Models
{
    public class DeckCardEntity : TableEntity
    {
        public DeckCardEntity(string owner_Deck, string deckCardName)
        {
            this.PartitionKey = owner_Deck;
            this.RowKey = deckCardName;
        }

        public DeckCardEntity() { }
        public string CardName { get; set; }
        public string CardSet { get; set; }
        public int NumberInDeck { get; set; }
    }
}
