using Eduverse.Repository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.PhanRepository
{
    public class PhanRepository : Repository<Model.Entities.Phan>, IPhanRepository
    {
        public PhanRepository(EduverseContext context) : base(context)
        { }
        }
}
