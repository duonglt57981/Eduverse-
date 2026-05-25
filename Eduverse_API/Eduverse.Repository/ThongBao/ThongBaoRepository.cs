using Eduverse.Repository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.ThongBao
{
    public class ThongBaoRepository : Repository<Model.Entities.ThongBao>, IThongBaoRepository
    {
                public ThongBaoRepository(EduverseContext context) : base(context)
        { }
    }
}
