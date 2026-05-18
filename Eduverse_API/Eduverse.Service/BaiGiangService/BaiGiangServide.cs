using Eduverse.IRepository.BaiGiang;
using Eduverse.IService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.BaiGiang
{
    public class BaiGiangServide : Service<Model.Entities.BaiGiang>, IBaiGiangService
    {
        public BaiGiangServide(IBaiGiangRepository baiGiangRepository) : base(baiGiangRepository)
        {
        }
    }
}
