using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.TienDoHocTapService.Dto;
using Eduverse.Service.TienDoHocTapService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.TienDoHocTapService
{
    public interface ITienDoHocTapService : IService<TienDoHocTap>
    {
        Task UpdateTienDoBaiGiang(UpdateTienDoBaiGiangRequest request);

        Task<TienDoKhoaHocDto> GetTienDoKhoaHoc(Guid idDangKy);
    }
}
