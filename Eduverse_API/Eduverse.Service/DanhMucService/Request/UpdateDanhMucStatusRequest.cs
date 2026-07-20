using System.ComponentModel.DataAnnotations;

namespace Eduverse.Service.DanhMucService.Request
{
    public class UpdateDanhMucStatusRequest
    {
        [Required(ErrorMessage = "Trạng thái không được để trống")]
        public string? TrangThai { get; set; }
    }
}
