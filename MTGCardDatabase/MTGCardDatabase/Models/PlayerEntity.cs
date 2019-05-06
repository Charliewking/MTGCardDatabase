using Microsoft.WindowsAzure.Storage.Table;
using MTGDatabase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGCardDatabase.Models
{
    public class PlayerEntity : TableEntity
    {
        public PlayerEntity(string playerName)
        {
            this.PartitionKey = "Player";
            this.RowKey = playerName;
        }
        public PlayerEntity() { }
        public string Name { get; set; }
        public List<DeckEntity> Decks { get; set; }
        public string RankConstructed { get; set; }
        public string RankLimited { get; set; }
        public int Bo1Wins { get; set; }
        public int Bo1Losses { get; set; }
        public int Bo3Wins { get; set; }
        public int Bo3Losses { get; set; }
    }
}
