using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.BaiGiangService.Request;
using Eduverse.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiGiangService
{
    public interface IBaiGiangService : IService<Model.Entities.BaiGiang>
    {
        Task<BaiGiangDto> CreateBaiGiang(CreateBaiGiangRequest request);

        //Task<BaiGiangDto> UpdateBaiGiang(UpdateBaiGiangRequest request);

        Task<bool> DeleteBaiGiang(Guid id);
    }
}
