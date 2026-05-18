using Eduverse.IRepository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.HoiDap
{
    public class HoiDapRepository : Repository<Model.Entities.HoiDap>, IHoiDapRepository
    {
        public HoiDapRepository(EduverseContext context) : base(context)
        {
        }
    }
}