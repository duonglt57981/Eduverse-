using Eduverse.Service.AppUserService.Dto;
using Eduverse.Service.Common;
using Eduverse.Service.Dto;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService
{
    public interface ILichSuKiemDuyetKhoaHocService : IService<Model.Entities.LichSuKiemDuyetKhoaHoc>
    {
        Task<PagedList<KhoaHocKiemDuyetListDto>> GetDanhSachKiemDuyet(KhoaHocKiemDuyetSearchDto search);
        Task<KiemDuyetDetailDto> GetDetailKiemDuyet(Guid idKhoaHoc);
        //Task<KiemDuyetKhoaHocDto> KiemDuyetKhoaHoc(KiemDuyetKhoaHocRequest request);
        Task<PagedList<KhoaHocKiemDuyetListDto>> GetListLichSuKiemDuyet(KhoaHocKiemDuyetSearchDto search);
        Task<KiemDuyetDetailDto> GetDetailLichSuKiemDuyet(Guid idKhoaHoc);
        Task<PagedList<NhanVienPheDuyetDto>> GetNhanVienPheDuyet(NhanVienSearch search);
        Task<PhanCongKiemDuyetResultDto> PhanDuyetKhoaHoc(Guid idNguoiDuyet, List<Guid>? danhSachKhoaHocId);
        //Task<KiemDuyetKhoaHocDto> KiemDuyetBaiGiang(KiemDuyetKhoaHocRequest request);
        //Task<KiemDuyetKhoaHocDto> KiemDuyetKhoaHoc(KiemDuyetKhoaHocRequest request);
        Task<KiemDuyetKhoaHocDto> KiemDuyetFullKhoaHoc(KiemDuyetKhoaHocRequest request);
        //Task<KiemDuyetKhoaHocDto> KiemDuyetTaiLieu(KiemDuyetKhoaHocRequest request);
        Task KiemTraVaNemExceptionAsync(string noiDung);
        //Task<KetQuaXuLyDuyetDto> KiemDuyetKhoaHocAsync(Guid idBanNhap);
        //Task<KetQuaXuLyDuyetDto> KiemDuyetPhanAsync(Guid idBanNhap);
        //Task<KetQuaXuLyDuyetDto> KiemDuyetBaiGiangAsync(Guid idBanNhap);
        //Task<KetQuaXuLyDuyetDto> KiemDuyetBaiKiemTraAsync(Guid idBanNhap);
        //Task<KetQuaXuLyDuyetDto> KiemDuyetCauHoiAsync(Guid idBanNhap);
    }
}
