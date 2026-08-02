using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.ThanhToanService.Dto
{
        public class TaoThanhToanDto
        {
            public List<Guid> KhoaHocIds { get; set; } = new();
            public List<string>? DanhSachMaGiamGia { get; set; }
        }

        public class TaoThanhToanResponseDto
        {
            public Guid DonHangId { get; set; }
            public string? MaGiaoDich { get; set; }
            public string? CheckoutUrl { get; set; }
            public string? QrCode { get; set; }
            public double SoTien { get; set; }
        }
    public class ApDungMaGiamGiaDto
    {
        public List<Guid> KhoaHocIds { get; set; } = new();
        public List<string> DanhSachMa { get; set; } = new();
    }

    public class ApDungMaGiamGiaResponseDto
        {
            public bool HopLe { get; set; }
            public string? ThongBao { get; set; }
            public int PhanTramGiam { get; set; }
            public double SoTienGoc { get; set; }
            public double SoTienGiam { get; set; }
            public double SoTienSauGiam { get; set; }
        }

    public class DonHangDto
        {
            public Guid Id { get; set; }
            public string? MaGiaoDich { get; set; }
            public double? SoTienThanhToan { get; set; }
            public double? SoTienGiamGia { get; set; }
            public int? TrangThai { get; set; }
            public string TrangThaiText => TrangThai switch
            {
                0 => "Chờ thanh toán",
                1 => "Thành công",
                2 => "Thất bại",
               3 => "Đã hủy",
                _ => "Không xác định"
            };
            public DateTime? NgayTao { get; set; }
            public List<DonHangChiTietDto>? ChiTiets { get; set; }
        }

        public class DonHangChiTietDto
        {
            public Guid? IdKhoaHoc { get; set; }
            public string? TenKhoaHoc { get; set; }
            public double? GiaLucDat { get; set; }
            public Guid? IdDangKi { get; set; }
    }

        // Webhook payload từ PayOS v2.1.0
        public class WebhookPayload
        {
            public string? Code { get; set; }
            public string? Desc { get; set; }
            public bool Success { get; set; }
            public WebhookPayloadData? Data { get; set; }
            public string? Signature { get; set; }
        }

        public class WebhookPayloadData
        {
            public long OrderCode { get; set; }
            public int Amount { get; set; }
            public string? Description { get; set; }
            public string? AccountNumber { get; set; }
            public string? Reference { get; set; }
            public string? TransactionDateTime { get; set; }
            public string? PaymentLinkId { get; set; }
            public string? Code { get; set; }
            public string? Desc { get; set; }
            public string? CounterAccountBankId { get; set; }
            public string? CounterAccountBankName { get; set; }
            public string? CounterAccountName { get; set; }
            public string? CounterAccountNumber { get; set; }
            public string? VirtualAccountName { get; set; }
            public string? VirtualAccountNumber { get; set; }
            public string? Currency { get; set; }
        }

    public class KetQuaApDungMaDto
    {
        public string MaGiamGia { get; set; }
        public bool HopLe { get; set; }
        public string ThongBao { get; set; }
        public int PhanTramGiam { get; set; }
        public Guid? IdKhoaHocDuocGiam { get; set; }
        public string? TenKhoaHocDuocGiam { get; set; }
        public double SoTienGiam { get; set; }
    }

    public class ApDungNhieuMaGiamGiaResponseDto
    {
        public List<KetQuaApDungMaDto> KetQua { get; set; } = new();
        public double SoTienGoc { get; set; }
        public double TongSoTienGiam { get; set; }
        public double SoTienSauGiam { get; set; }
    }
}
