using Eduverse.Model;
using Eduverse.Repository.Common;
using Eduverse.Repository.DanhMucRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.DanhMuc_KhoaHocRepository
{
    public class DanhMuc_KhoaHocRepository : Repository<Model.Entities.DanhMuc_KhoaHoc>, IDanhMuc_KhoaHocRepository
    {
        public DanhMuc_KhoaHocRepository(EduverseContext context) : base(context)
        {
        }
    }
}
