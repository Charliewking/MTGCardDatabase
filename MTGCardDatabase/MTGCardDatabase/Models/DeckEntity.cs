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
        public string Owner { get; set; }
        public CardEntity[] MainDeck { get; set; }
        public CardEntity[] Sideboard { get; set; }
        public bool Constructed { get; set; }
        public string Color1 { get; set; }
        public string Color2 { get; set; }
        public string Color3 { get; set; }
        public string Color4 { get; set; }
        public string Color5 { get; set; }
        public int RedCards { get; set; }
        public int BlueCards { get; set; }
        public int WhiteCards { get; set; }
        public int BlackCards { get; set; }
        public int GreenCards { get; set; }
        public int ArtifactCards { get; set; }
        public int GWCards { get; set; }
        public int GRCards { get; set; }
        public int UGCards { get; set; }
        public int GBCards { get; set; }
        public int WRCards { get; set; }
        public int BWCards { get; set; }
        public int UWCards { get; set; }
        public int UBCards { get; set; }
        public int URCards { get; set; }
        public int RBCards { get; set; }
        public int LandCards { get; set; }
        public int CreatureCount { get; set; }
        public int SorceryCount { get; set; }
        public int InstantCount { get; set; }
        public int EnchantmentCount { get; set; }
        public int RareCount { get; set; }
        public int UncommonCount { get; set; }
        public int MythicCount { get; set; }
        public int HumanCount { get; set; }
        public int ZombieCount { get; set; }
        public int WizardCount { get; set; }
        public int ShamanCount { get; set; }
        public int KnightCount { get; set; }
        public int AverageCMC { get; set; }
        public int CardCount { get; set; }
    }
}
