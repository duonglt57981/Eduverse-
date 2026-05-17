using Eduverse.IRepository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.LienKet
{
    public class LienKetRepository : Repository<Model.Entities.LienKet>, ILienKetRepository
    {
        public LienKetRepository(EduverseContext context) : base(context)
        {
        }
    }
}
