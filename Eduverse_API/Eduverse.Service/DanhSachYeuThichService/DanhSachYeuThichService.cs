using Eduverse.Repository.DanhSachYeuThichRepository;
using Eduverse.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhSachYeuThichService
{
    public class DanhSachYeuThichService : Service<Model.Entities.DanhSachYeuThich>, IDanhSachYeuThichService
    {
        public DanhSachYeuThichService(IDanhSachYeuThichRepository danhSachYeuThichRepository) : base(danhSachYeuThichRepository)
        {
        }
    }
}
