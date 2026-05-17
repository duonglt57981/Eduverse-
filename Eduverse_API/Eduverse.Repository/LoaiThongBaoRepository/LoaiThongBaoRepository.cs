using Eduverse.IRepository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.LoaiThongBao
{
    public class LoaiThongBaoRepository : Repository<Model.Entities.LoaiThongBao>, ILoaiThongBaoRepository
    {
        public LoaiThongBaoRepository(EduverseContext context) : base(context)
        {
        }
    }
}
