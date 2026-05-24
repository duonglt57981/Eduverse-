using Eduverse.IRepository.DanhMuc;
using Eduverse.IService.Common;
using Eduverse.IService.DanhMucService;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhMuc_KhoaHocService
{
    public class DanhMuc_KhoaHocService : Service<Model.Entities.DanhMuc_KhoaHoc>, IDanhMuc_KhoaHocService
    {
        public DanhMuc_KhoaHocService(IDanhMuc_KhoaHocRepository danhMuc_KhoaHocRepository) : base(danhMuc_KhoaHocRepository)
        {
        }
    }
}
