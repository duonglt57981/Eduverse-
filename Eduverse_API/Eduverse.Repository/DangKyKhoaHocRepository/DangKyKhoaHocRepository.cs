using Eduverse.Model;
using Eduverse.IRepository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IRepository.DangKyKhoaHoc
{
    public class DangKyKhoaHocRepository : Repository<Model.Entities.DangKyKhoaHoc>, IDangKyKhoaHocRepository
    {
        public DangKyKhoaHocRepository(EduverseContext context) : base(context)
        {
        }
    }
}