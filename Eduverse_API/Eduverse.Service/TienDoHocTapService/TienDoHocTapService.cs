using Eduverse.IRepository.Common;
using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.TienDoHocTapService
{
    public class TienDoHocTapService : Service<TienDoHocTap>, ITienDoHocTapService
    {
        public TienDoHocTapService(IRepository<TienDoHocTap> repository) : base(repository)
        {
        }
    }
}
