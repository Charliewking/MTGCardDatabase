using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGCardDatabase.Models
{
    public class DeckStatsEntity : TableEntity
    {
        public DeckStatsEntity(string statsPartition, string owner_Deck)
        {
            this.PartitionKey = statsPartition;
            this.RowKey = owner_Deck;
        }
        public DeckStatsEntity() { }

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

    }
}
