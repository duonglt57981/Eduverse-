using Eduverse.IRepository.Common;
using Eduverse.IService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.TaiLieuService
{
    public class TaiLieuService : Service<Model.Entities.TaiLieu>, ITaiLieuService
    {
        public TaiLieuService(IRepository<Model.Entities.TaiLieu> repository) : base(repository)
        {
        }
    }
}
