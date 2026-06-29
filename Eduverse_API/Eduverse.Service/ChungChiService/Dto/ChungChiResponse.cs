using System;

namespace Eduverse.Service.ChungChiService.Dto
{
	public class ChungChiResponse
	{
		public Guid Id { get; set; }
		public string? MaSoChungChi { get; set; }
		public string? TenChungChi { get; set; }
		public string? URL_ChungChi { get; set; }
		public DateTime? NgayCap { get; set; }
		public DateTime? NgayHetHan { get; set; }
		public string? TrangThai { get; set; }
		public int? TongThoiGianHoc { get; set; }
		public double? DiemTongKet { get; set; }
		public DateTime? NgayTao { get; set; }
		public Guid? IdDangKi { get; set; }
		public Guid? IdKhoaHoc { get; set; }
		public Guid? IdNguoiDung { get; set; }

		public string? TenKhoaHoc { get; set; }
		public string? TenNguoiDung { get; set; }
	}
}