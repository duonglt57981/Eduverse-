
using Eduverse.IService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Repository.ChungChiRepository;

namespace Eduverse.IService.ChungChiService
{
    public class ChungChiService : Service<Model.Entities.ChungChi>, IChungChiService
    {
        public ChungChiService(IChungChiRepository chungChRepository) : base(chungChRepository)
        { } 
        }
}
