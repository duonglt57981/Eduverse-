using Eduverse.Repository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.LienKetRepository
{
    public class LienKetRepository : Repository<Model.Entities.LienKet>, ILienKetRepository
    {
        public LienKetRepository(EduverseContext context) : base(context)
        {
        }
    }
}
