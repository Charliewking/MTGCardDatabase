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
        public string Owner { get; set; }
        public string DeckName { get; set; }
        public string CardName { get; set; }
        public string CardSet { get; set; }
        public string Mana_Cost { get; set; }
        public string Type_Line { get; set; }
        public string Color1 { get; set; }
        public string Color2 { get; set; }
        public string Color3 { get; set; }
        public string Color4 { get; set; }
        public string Color5 { get; set; }
        public int NumberInDeck { get; set; }
        public int NumberInSideboard { get; set; }
        public bool CountLimited { get; set; }
    }
}
