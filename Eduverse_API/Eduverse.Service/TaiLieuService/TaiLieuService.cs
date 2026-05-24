using Eduverse.Repository.TaiLieuRepository;
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
        public TaiLieuService(ITaiLieuRepository repository) : base(repository)
        {
        }
    }
}
