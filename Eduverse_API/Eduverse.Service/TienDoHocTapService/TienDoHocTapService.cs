using Eduverse.Repository.Common;
using Eduverse.Service.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.TienDoHocTapRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.TienDoHocTapService
{
    public class TienDoHocTapService : Service<TienDoHocTap>, ITienDoHocTapService
    {
        public TienDoHocTapService(ITienDoHocTapRepository tienDoHocTapRepository) : base(tienDoHocTapRepository)
        {
        }
    }
}
