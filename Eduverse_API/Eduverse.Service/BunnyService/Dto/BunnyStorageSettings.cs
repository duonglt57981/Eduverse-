using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BunnyService.Dto
{
    public class BunnyStorageSettings
    {
        public string StorageZoneName { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string Region { get; set; } = "sg";
        public string BaseUrl { get; set; } = "https://sg.storage.bunnycdn.com";
        public string PullZoneUrl { get; set; } = string.Empty;
    }
}
