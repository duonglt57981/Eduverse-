
using Eduverse.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Repository.ChungChiRepository;

namespace Eduverse.Service.ChungChiService
{
    public class ChungChiService : Service<Model.Entities.ChungChi>, IChungChiService
    {
        public ChungChiService(IChungChiRepository chungChRepository) : base(chungChRepository)
        { } 
        }
}
