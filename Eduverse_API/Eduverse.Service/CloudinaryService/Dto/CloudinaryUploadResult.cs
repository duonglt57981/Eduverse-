using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.CloudinaryService.Dto
{
    public class CloudinaryUploadResult
    {
        public bool Success { get; set; }
        public string PublicId { get; set; }
        public string Url { get; set; }
        public int Duration { get; set; }
        public int ChunkNumber { get; set; }
        public bool IsCompleted { get; set; }
        public string FileName { get; set; }
        public string Error { get; set; }
    }
}
