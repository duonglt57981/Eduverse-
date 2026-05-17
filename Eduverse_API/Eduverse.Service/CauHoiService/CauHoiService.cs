using Eduverse.IRepository.CauHoi;
using Eduverse.IService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.CauHoi
{
    public class CauHoiService : Service<Model.Entities.CauHoi>, ICauHoiService
    {
        public CauHoiService(ICauHoiRepository cauHoiRepository) : base(cauHoiRepository)
        {
        }
    }
}
