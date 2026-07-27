using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Eduverse.Service.BunnyService.Request
{
    public class CreateVideoRequest
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("collectionId")]
        public string? CollectionId { get; set; }

        [JsonPropertyName("thumbnailTime")]
        public int ThumbnailTime { get; set; } = 5000;

        [JsonPropertyName("enabledResolutions")]
        public string? EnabledResolutions { get; set; }

        [JsonPropertyName("outputCodecs")]
        public string? OutputCodecs { get; set; }

        [JsonPropertyName("jitEncodingEnabled")]
        public bool? JitEncodingEnabled { get; set; }

        [JsonPropertyName("enableMP4Fallback")]
        public bool? EnableMP4Fallback { get; set; }
    }
}
