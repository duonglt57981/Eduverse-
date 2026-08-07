using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.KhoaHoc_GiangVienRepository
{
    public class KhoaHoc_GiangVienRepository
    : Repository<KhoaHoc_GiangVien>, IKhoaHoc_GiangVienRepository
    {
        public KhoaHoc_GiangVienRepository(EduverseContext context) : base(context) { }
    }
}
