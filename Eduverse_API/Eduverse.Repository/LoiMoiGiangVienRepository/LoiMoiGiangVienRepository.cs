using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.LoiMoiGiangVienRepository
{
    public class LoiMoiGiangVienRepository
    : Repository<LoiMoiGiangVien>, ILoiMoiGiangVienRepository
    {
        public LoiMoiGiangVienRepository(EduverseContext context) : base(context) { }
    }
}
