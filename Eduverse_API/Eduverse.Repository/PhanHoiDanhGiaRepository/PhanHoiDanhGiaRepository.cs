using Eduverse.Model;
using Eduverse.Repository.Common;
using Eduverse.Repository.LikeHoiDapRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.PhanHoiDanhGiaRepository
{
    public class PhanHoiDanhGiaRepository : Repository<Model.Entities.PhanHoiDanhGia>, IPhanHoiDanhGiaRepository
    {
        public PhanHoiDanhGiaRepository(EduverseContext context) : base(context)
        {
        }
    }
}
