using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BunnyService.Dto
{
    public class BunnyDto
    {
        public string Id { get; set; } = string.Empty;           // Video GUID
        public string Title { get; set; } = string.Empty;        // Tiêu đề video
        public string Url { get; set; } = string.Empty;          // URL phát video
        public string Mp4Url { get; set; } = string.Empty;       // URL MP4 fallback
        public string ThumbnailUrl { get; set; } = string.Empty; // URL thumbnail
        public int Duration { get; set; }                       // Thời lượng (giây)
        public long Size { get; set; }                          // Kích thước (bytes)
        public int Status { get; set; }                         // Trạng thái
        public List<string> AvailableResolutions { get; set; } = new(); // Các độ phân giải
        public DateTime DateUploaded { get; set; }              // Ngày upload
        public string Message { get; set; } = string.Empty;     // Thông báo
        public bool Success { get; set; } = true;               // Thành công?
    }
}
