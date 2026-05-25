using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhGiaRepository;
using Eduverse.Service.Common;
using Eduverse.Service.DanhGiaService;
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
