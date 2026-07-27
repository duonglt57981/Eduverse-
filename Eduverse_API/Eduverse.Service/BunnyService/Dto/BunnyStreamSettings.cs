using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BunnyService.Dto
{
    public class BunnyStreamSettings
    {
        public string LibraryId { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://video.bunnycdn.com";
        public string CDNHostname { get; set; } = string.Empty;
        public string EnabledResolutions { get; set; } = "480p,720p,1080p";
        public string OutputCodecs { get; set; } = "x264";
        public bool JitEncoding { get; set; } = true;
        public bool EnableMP4Fallback { get; set; } = true;
        public int MaxFileSizeMB { get; set; } = 100;
        public int MinResolutionHeight { get; set; } = 480;
    }
}