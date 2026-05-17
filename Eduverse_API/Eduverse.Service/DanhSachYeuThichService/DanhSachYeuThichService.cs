using Eduverse.IRepository.DanhSachYeuThich;
using Eduverse.IService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.DanhSachYeuThichService
{
    public class DanhSachYeuThichService : Service<Model.Entities.DanhSachYeuThich>, IDanhSachYeuThichService
    {
        public DanhSachYeuThichService(IDanhSachYeuThichRepository danhSachYeuThichRepository) : base(danhSachYeuThichRepository)
        {
        }
    }
}
