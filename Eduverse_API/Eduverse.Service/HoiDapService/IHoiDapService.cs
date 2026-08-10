using Eduverse.Model.Entities;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.Common;
using Eduverse.Service.HoiDapService.Dto;
using Eduverse.Service.HoiDapService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.HoiDapService
{
    public interface IHoiDapService : IService<HoiDap>
    {
        Task<HoiDapDto> DatCauHoi(DatCauHoiRequest request);
        Task<TraLoiDto> TraLoi(TraLoiRequest request);
        Task<PagedList<HoiDapDto>> GetDanhSachCauHoi(SearchHoiDapRequest request);
        Task<HoiDapDto> GetChiTiet(Guid idCauHoi);
        Task<int> ToggleLike(Guid idTraLoi);
        Task GhimCauHoi(Guid idCauHoi, bool ghim);
        Task GhimTraLoi(Guid idTraLoi, bool ghim);
        Task DongCauHoi(Guid idCauHoi, bool dong);
        Task XoaCauHoi(Guid idCauHoi);
        Task XoaTraLoi(Guid idTraLoi);
        Task<TraLoiDto> Reply(ReplyRequest request);
        Task<PagedList<HoiDapDto>> GetDanhSachChoGiangVien(SearchHoiDapRequest request);
        Task GhimTopAnswer(Guid idTraLoi, bool ghim);
    }
}
