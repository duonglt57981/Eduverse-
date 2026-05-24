using Eduverse.IRepository.DangKyKhoaHoc;
using Eduverse.IRepository.DanhGia;
using Eduverse.IService.Common;
using Eduverse.IService.DanhGiaService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DangKyKhoaHocService
{
    public class DangKyKhoaHocService : Service<Model.Entities.DangKyKhoaHoc>, IDangKyKhoaHocService
    {
        public DangKyKhoaHocService(IDangKyKhoaHocRepository dangKyKhoaHocRepository) : base(dangKyKhoaHocRepository)
        {
        }
    }
}
