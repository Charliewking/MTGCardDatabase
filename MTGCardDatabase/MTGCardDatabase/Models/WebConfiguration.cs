using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGDatabase.Models
{
    public class WebConfiguration
    {
        public string mtgdatabaseConnectionString { get; set; }
        public string cardTableName { get; set; }
        public string deckTableName { get; set; }
        public string deckCardTableName { get; set; }
        public string cubeStats { get; set; }
    }
}
