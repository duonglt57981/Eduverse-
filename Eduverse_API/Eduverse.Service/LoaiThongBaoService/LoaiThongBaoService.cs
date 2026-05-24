using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.LoaiThongBaoRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.LoaiThongBaoService
{
    public class LoaiThongBaoService : Service<LoaiThongBao>, ILoaiThongBaoService
    {
        public LoaiThongBaoService(ILoaiThongBaoRepository loaiThongBaoRepository) : base(loaiThongBaoRepository)
        {
        }
    }
}
