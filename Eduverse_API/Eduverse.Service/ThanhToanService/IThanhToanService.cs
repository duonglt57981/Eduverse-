using Eduverse.Service.Common;
using Eduverse.Model.Entities;
using Eduverse.Service.ThanhToanService.Dto;
using PayOS.Models.Webhooks;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.ThanhToanService
{
    public interface IThanhToanService : IService<ThanhToan>
    {
        Task<TaoThanhToanResponseDto> TaoThanhToanAsync(
            Guid userId,
            TaoThanhToanDto dto);

        Task<bool> XuLyWebhookAsync(Webhook webhook);

        Task<List<DonHangDto>> GetDonHangByUserAsync(Guid userId);

        Task<DonHangDto?> GetDonHangByIdAsync(Guid id);
        Task<ApDungNhieuMaGiamGiaResponseDto> KiemTraMaGiamGiaAsync(ApDungMaGiamGiaDto dto);
    }
}
