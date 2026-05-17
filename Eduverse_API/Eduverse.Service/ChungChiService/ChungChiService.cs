using Eduverse.IRepository.ChungChi;
using Eduverse.IService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.ChungChiService
{
    public class ChungChiService : Service<Model.Entities.ChungChi>, IChungChiService
    {
        public ChungChiService(IChungChiRepository chungChiRepository) : base(chungChiRepository)
        { } 
        }
}
