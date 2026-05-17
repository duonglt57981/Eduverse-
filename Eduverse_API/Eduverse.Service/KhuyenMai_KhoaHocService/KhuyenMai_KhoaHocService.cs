using Eduverse.IRepository.Common;
using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.KhuyenMai_KhoaHoc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.KhuyenMai_KhoaHocService
{
    public class KhuyenMai_KhoaHocService : Service<KhuyenMai_KhoaHoc>, IKhuyenMai_KhoaHocService
    {
        public KhuyenMai_KhoaHocService(IKhuyenMai_KhoaHocRepository khuyenMai_KhoaHocRepository) : base(khuyenMai_KhoaHocRepository)
        {
        }
    }
}
