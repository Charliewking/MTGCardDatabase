using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGDatabase.Models
{
    public class WebConfiguration
    {


        internal string mtgdatabaseConnectionString { get; set; }
        internal string cardTableName { get; set; }
        internal string deckTableName { get; set; }
        internal string deckCardTableName { get; set; }
        internal string deckTrackerTableName;
        internal string cubeStats { get; set; }

    }
}
