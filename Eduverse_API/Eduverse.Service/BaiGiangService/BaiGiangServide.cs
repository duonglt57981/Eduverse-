using Eduverse.Repository.BaiGiangRepository;
using Eduverse.IService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.BaiGiang
{
    public class BaiGiangService : Service<Model.Entities.BaiGiang>, IBaiGiangService
    {
        public BaiGiangService(IBaiGiangRepository baiGiangRepository) : base(baiGiangRepository)
        {
        }
    }
}
