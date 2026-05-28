using Eduverse.Service.BaiKiemTraService.Dto;
using Eduverse.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService
{
    public interface IBaiKiemTraSevice : IService<Model.Entities.BaiKiemTra>
    {
        Task<BaiKiemTraDto> GetQuiz(Guid id);
    }
}
