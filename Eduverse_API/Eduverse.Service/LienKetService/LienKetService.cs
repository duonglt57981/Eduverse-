using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.LienKetRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.LienKetService
{
    public class LienKetService : Service<LienKet>, ILienKetService
    {
        public LienKetService(ILienKetRepository lienKetRepository) : base(lienKetRepository)
        {
        }
    }
}
