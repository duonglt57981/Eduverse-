using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.YeuCauRutTienService.Dto;
using Eduverse.Service.YeuCauRutTienService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.YeuCauRutTienService
{
    public interface IYeuCauRutTienService : IService<YeuCauRutTien>
    {
        Task<List<YeuCauRutTienDto>> GetByUserAsync(Guid userId);
        Task<List<YeuCauRutTienDto>> GetAllAsync(); // Admin
        Task<decimal> GetSoDuAsync(Guid userId);
        Task TaoYeuCauAsync(Guid userId, TaoYeuCauRutTienDto dto);
        Task XuLyYeuCauAsync(Guid id, XuLyYeuCauDto dto); // Admin
        Task GuiOtpAsync(Guid userId, GuiOtpRutTienRequest request);
        Task HuyYeuCauAsync(Guid id, Guid userId);

    }
}
