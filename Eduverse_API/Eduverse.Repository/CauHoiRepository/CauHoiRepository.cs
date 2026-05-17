using Eduverse.IRepository.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IRepository.CauHoi
{
    public class CauHoiRepository : Repository<Model.Entities.CauHoi>, ICauHoiRepository
    {
        public CauHoiRepository(Model.EduverseContext context) : base(context)
        {
        }
    }
}
