using Eduverse.Repository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.TienDoHocTapRepository
{
    public class TienDoHocTapRepository : Repository<Model.Entities.TienDoHocTap>, ITienDoHocTapRepository
    {
        public TienDoHocTapRepository(EduverseContext context) : base(context)
        { }
        }
}
