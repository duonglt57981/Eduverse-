using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhuyenMaiService.Dto;
using Eduverse.Service.LoiMoiGiangVienService.Dto;
using Eduverse.Service.LoiMoiGiangVienService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LoiMoiGiangVienService
{
    public interface    ILoiMoiGiangVienService
    {
        // Người tạo khóa học gửi lời mời
        Task<LoiMoiGiangVienDto> GuiLoiMoi(GuiLoiMoiRequest request);

        // Người được mời phản hồi
        Task PhanHoi(Guid idLoiMoi, bool dongY);

        // Người tạo cập nhật quyền (cả khi đang Pending lẫn đã Accepted)
        Task CapNhatQuyen(Guid idLoiMoi, CapNhatQuyenRequest request);

        // Hủy lời mời / kick cộng tác viên (chỉ chủ sở hữu)
        Task HuyLoiMoi(Guid idLoiMoi);

        // Lấy danh sách giảng viên của 1 khóa học (cho trang Quản lý giảng viên)
        Task<DanhSachGiangVienDto> GetDanhSachGiangVien(Guid idKhoaHoc);
        Task<List<LichSuNhanTheoDonDto>> GetLichSuDonHang(Guid idKhoaHoc, Guid idGiangVien);
        Task<List<LichSuThayDoiTyLeDto>> GetLichSuThayDoiTyLe(Guid idKhoaHoc, Guid idGiangVien);

        Task CapNhatQuyenTheoGiangVien(Guid idKhoaHoc, Guid idGiangVien, CapNhatQuyenRequest request);

        // Hủy/kick theo idGiangVien + idKhoaHoc
        Task HuyTheoGiangVien(Guid idKhoaHoc, Guid idGiangVien);
        Task<List<LoiMoiChoXacNhanDto>> GetLoiMoiCuaToi();

        Task CapNhatQuyenHangLoat(Guid idKhoaHoc, CapNhatQuyenHangLoatRequest request);
        Task<QuyenCuaToiDto> GetQuyenCuaToi(Guid idKhoaHoc);
        Task<int> BackfillDonHangGiangVienAsync();
        Task<List<Guid>> TaoLoiMoiApDungKhuyenMai(Guid idKhuyenMai, List<Guid> idsKhoaHoc);
        Task<List<LoiMoiKhuyenMaiChoXacNhanDto>> GetLoiMoiKhuyenMaiCuaToi();
        Task PhanHoiKhuyenMai(Guid idLoiMoi, bool dongY);
        Task<List<LoiMoiApDungKhuyenMaiDto>> GetLoiMoiApDungTheoKhuyenMai(Guid idKhuyenMai);
        Task HuyLoiMoiApDungKhuyenMaiTheoMa(Guid idKhuyenMai);
        Task HuyLoiMoiApDungKhuyenMaiTheoKhoaHoc(Guid idKhuyenMai, List<Guid> idsKhoaHoc);
        Task<bool> LayTrangThaiEduverseDeals(Guid idKhoaHoc);
        Task ThamGiaEduverseDeals(Guid idKhoaHoc);
        Task HuyEduverseDeals(Guid idKhoaHoc);
        Task<List<KhoaHocMiniDto>> GetKhoaHocDuocThamGiaEduverseDeals();
    }
}
