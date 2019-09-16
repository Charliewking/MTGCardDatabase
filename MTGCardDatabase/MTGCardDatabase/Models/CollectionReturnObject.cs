using Microsoft.WindowsAzure.Storage.Table;
using MTGDatabase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MTGCardDatabase.Models
{
    public class CollectionReturnObject
    {
        public List<CardEntity> ReturnList { get; set; }
        public TableContinuationToken Token { get; set; }
    }
}
