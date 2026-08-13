using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Exceptions;
using Microsoft.AspNetCore.Http;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Validate
{
    public static class PhanCongKiemDuyetValidator
    {
        public const int MaxCourseIds = 100;

        public static List<Guid> NormalizeCourseIds(IReadOnlyCollection<Guid>? courseIds)
        {
            if (courseIds == null || courseIds.Count == 0)
                throw new PhanCongKiemDuyetException(
                    StatusCodes.Status400BadRequest,
                    "Vui lòng chọn ít nhất một khóa học.");
            if (courseIds.Count > MaxCourseIds)
                throw new PhanCongKiemDuyetException(
                    StatusCodes.Status400BadRequest,
                    $"Mỗi lần chỉ được phân công tối đa {MaxCourseIds} khóa học.");
            if (courseIds.Any(id => id == Guid.Empty))
                throw new PhanCongKiemDuyetException(
                    StatusCodes.Status400BadRequest,
                    "Danh sách có ID khóa học không hợp lệ.");

            return courseIds.Distinct().ToList();
        }
    }
}
