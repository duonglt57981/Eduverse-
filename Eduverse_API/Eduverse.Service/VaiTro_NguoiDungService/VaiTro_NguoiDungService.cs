using Eduverse.IService.Common;
using Eduverse.Repository.VaiTro_NguoiDungRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.VaiTro_NguoiDungService
{
    public class VaiTro_NguoiDungService : Service<Model.Entities.VaiTro_NguoiDung>, IVaiTro_NguoiDungService
    {
        public VaiTro_NguoiDungService(IVaiTro_NguoiDungRepository vaiTro_NguoiDungRepository) : base(vaiTro_NguoiDungRepository)
        {
        }
    }
}
