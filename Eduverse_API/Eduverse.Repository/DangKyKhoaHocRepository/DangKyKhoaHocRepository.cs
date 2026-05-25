using Eduverse.Model;
using Eduverse.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.DangKyKhoaHocRepository
{
    public class DangKyKhoaHocRepository : Repository<Model.Entities.DangKyKhoaHoc>, IDangKyKhoaHocRepository
    {
        public DangKyKhoaHocRepository(EduverseContext context) : base(context)
        {
        }
    }
}