using System.Linq.Expressions;
using Eduverse.Model.Entities;

namespace Eduverse.Service.KhoaHocService
{
    public static class CourseSearchQuery
    {
        public static Expression<Func<KhoaHoc, bool>> BuildWordPrefixPredicate(
            string keyword)
        {
            var normalizedKeyword = keyword.Trim().ToLowerInvariant();
            if (normalizedKeyword.Length == 0)
            {
                throw new ArgumentException("Từ khóa tìm kiếm không được để trống.", nameof(keyword));
            }

            var wordPrefix = " " + normalizedKeyword;
            var searchDescription = normalizedKeyword.Length >= 3;

            return course =>
                (course.TieuDe != null &&
                    (course.TieuDe.ToLower().StartsWith(normalizedKeyword) ||
                     course.TieuDe.ToLower().Contains(wordPrefix))) ||
                (searchDescription && course.MoTa != null &&
                    (course.MoTa.ToLower().StartsWith(normalizedKeyword) ||
                     course.MoTa.ToLower().Contains(wordPrefix))) ||
                (course.LoaiKhoaHoc != null &&
                    (course.LoaiKhoaHoc.ToLower().StartsWith(normalizedKeyword) ||
                     course.LoaiKhoaHoc.ToLower().Contains(wordPrefix)));
        }
    }
}
