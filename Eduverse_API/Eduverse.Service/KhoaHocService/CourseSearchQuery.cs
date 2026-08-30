using System.Linq.Expressions;
using Eduverse.Model.Entities;
using Eduverse.Service.ElasticsearchService;

namespace Eduverse.Service.KhoaHocService
{
    public static class CourseSearchQuery
    {
        public static Expression<Func<KhoaHoc, bool>> BuildWordPrefixPredicate(
            string keyword)
        {
            var searchVariants = CourseSearchVocabulary.GetSearchVariants(keyword);
            if (searchVariants.Count == 0)
            {
                throw new ArgumentException("Từ khóa tìm kiếm không được để trống.", nameof(keyword));
            }

            Expression<Func<KhoaHoc, bool>>? combinedPredicate = null;
            foreach (var variant in searchVariants)
            {
                var variantPredicate = BuildSingleWordPrefixPredicate(variant);
                if (combinedPredicate == null)
                {
                    combinedPredicate = variantPredicate;
                    continue;
                }

                var parameter = combinedPredicate.Parameters[0];
                var variantBody = new ParameterReplaceVisitor(
                        variantPredicate.Parameters[0],
                        parameter)
                    .Visit(variantPredicate.Body)!;

                combinedPredicate = Expression.Lambda<Func<KhoaHoc, bool>>(
                    Expression.OrElse(combinedPredicate.Body, variantBody),
                    parameter);
            }

            return combinedPredicate!;
        }

        private static Expression<Func<KhoaHoc, bool>> BuildSingleWordPrefixPredicate(
            string keyword)
        {
            var normalizedKeyword = keyword.Trim().ToLowerInvariant();
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

        private sealed class ParameterReplaceVisitor : ExpressionVisitor
        {
            private readonly ParameterExpression _source;
            private readonly ParameterExpression _target;

            public ParameterReplaceVisitor(
                ParameterExpression source,
                ParameterExpression target)
            {
                _source = source;
                _target = target;
            }

            protected override Expression VisitParameter(ParameterExpression node)
            {
                return node == _source ? _target : base.VisitParameter(node);
            }
        }
    }
}
