using System.Text.Json.Serialization;

namespace Eduverse.Service.BunnyService.Response
{
    public class VideoInfoResponse
    {
        [JsonPropertyName("guid")]
        public string Guid { get; set; } = string.Empty;

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("videoLibraryId")]
        public int VideoLibraryId { get; set; }

        [JsonPropertyName("status")]
        public int Status { get; set; }  // 0 = Processing, 1 = Ready, 2 = Error

        [JsonPropertyName("length")]
        public long Length { get; set; } // Thời lượng (milliseconds)

        [JsonPropertyName("size")]
        public long Size { get; set; }   // Kích thước (bytes)

        [JsonPropertyName("dateUploaded")]
        public string DateUploaded { get; set; } = string.Empty;

        [JsonPropertyName("dateUpdated")]
        public string DateUpdated { get; set; } = string.Empty;

        [JsonPropertyName("thumbnailFileName")]
        public string ThumbnailFileName { get; set; } = string.Empty;

        [JsonPropertyName("hasMP4Fallback")]
        public bool HasMP4Fallback { get; set; }

        [JsonPropertyName("hasWebM")]
        public bool HasWebM { get; set; }

        [JsonPropertyName("collectionId")]
        public int? CollectionId { get; set; }

        [JsonPropertyName("collectionName")]
        public string? CollectionName { get; set; }

        [JsonPropertyName("isPublic")]
        public bool IsPublic { get; set; }

        [JsonPropertyName("availableResolutions")]
        public List<string> AvailableResolutions { get; set; } = new();

        [JsonPropertyName("playUrl")]
        public string? PlayUrl { get; set; }

        [JsonPropertyName("MP4FallbackUrl")]
        public string? MP4FallbackUrl { get; set; }

        [JsonPropertyName("thumbnailUrl")]
        public string? ThumbnailUrl { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("errorCode")]
        public int? ErrorCode { get; set; }
    }
}