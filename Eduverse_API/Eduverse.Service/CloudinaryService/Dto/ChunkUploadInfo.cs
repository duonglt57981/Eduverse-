using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.CloudinaryService.Dto
{
    public class ChunkUploadInfo
    {
        public string UploadId { get; set; }
        public string FileName { get; set; }
        public int TotalChunks { get; set; }
        public int UploadedChunks { get; set; }
        public List<string> PublicIds { get; set; }
    }
}
