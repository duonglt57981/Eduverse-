using System;

namespace Eduverse.Service.DanhMucService.Dto
{
    public class DanhMucStatsDto
    {
        public int TotalCount { get; set; }
        public int ActiveCount { get; set; }
        public int InactiveCount { get; set; }
        public int LinkedCoursesCount { get; set; }
    }
}
