using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.ThongBao;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.ThongBaoService
{
    public class ThongBaoService : Service<ThongBao>, IThongBaoService
    {
        public ThongBaoService(IThongBaoRepository thongBaoRepository) : base(thongBaoRepository)
        {
        }
    }
}
