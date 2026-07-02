using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.NganHangService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.NganHangService
{
    public interface INganHangService : IService<NganHang>
    {
        Task<List<NganHangDto>> GetByUserAsync(Guid userId);
        Task<NganHangDto> TaoNganHangAsync(Guid userId, TaoNganHangDto dto);
        Task XoaNganHangAsync(Guid id, Guid userId);
    }
}
