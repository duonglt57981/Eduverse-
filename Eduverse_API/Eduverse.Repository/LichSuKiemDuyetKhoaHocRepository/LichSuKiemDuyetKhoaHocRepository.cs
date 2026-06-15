using Eduverse.Model;
using Eduverse.Repository.Common;
using Eduverse.Repository.LienKetRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.LichSuKiemDuyetKhoaHocRepository
{
    public class LichSuKiemDuyetKhoaHocRepository : Repository<Model.Entities.LichSuKiemDuyetKhoaHoc>, ILichSuKiemDuyetKhoaHocRepository
    {
        public LichSuKiemDuyetKhoaHocRepository(EduverseContext context) : base(context)
        {
        }
    }
}
