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
        public string Name { get; set; }
        public string Colors { get; set; }
        public string Color1 { get; set; }
        public string Color2 { get; set; }
        public string Color3 { get; set; }
        public string Color4 { get; set; }
        public string Color5 { get; set; }
        public string Rarity { get; set; }
        public int Power { get; set; }
        public int Toughness { get; set; }
        public string Color_Identity { get; set; }
        public string Cmc { get; set; }
        public string Set_Name { get; set; }
        public string Set_Short { get; set; }
        public string Type_Line { get; set; }
        public string ConvertedCost { get; set; }
        public int NumberInCollection { get; set; }
        public string Mana_Cost { get; set; }
        public string Flavor_Text { get; set; }
        public string Card_Text { get; set; }
        public string Image_Small { get; set; }
        public string Image_Normal { get; set; }
        public string Image_Large { get; set; }
        public string Price { get; set; }
    }
}
