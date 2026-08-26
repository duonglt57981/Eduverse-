using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Service.KhoaHocService;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Eduverse.Tests;

public class CourseSearchQueryTests
{
    [Theory]
    [InlineData("Ruby căn bản")]
    [InlineData("Khóa học lập trình Ruby")]
    [InlineData("Khóa học lập trình RUBY nâng cao")]
    public void WordPrefix_MatchesAtTheStartOfAWord(string title)
    {
        var predicate = CourseSearchQuery
            .BuildWordPrefixPredicate("ru")
            .Compile();

        Assert.True(predicate(new KhoaHoc { TieuDe = title }));
    }

    [Theory]
    [InlineData("Khóa học trung cấp")]
    [InlineData("Triết học cho người mới")]
    [InlineData("Microsoft Word toàn diện")]
    public void WordPrefix_DoesNotMatchInsideAWord(string title)
    {
        var predicate = CourseSearchQuery
            .BuildWordPrefixPredicate("ru")
            .Compile();

        Assert.False(predicate(new KhoaHoc { TieuDe = title }));
    }

    [Fact]
    public void WordPrefix_DoesNotSearchHiddenDescriptionForShortKeywords()
    {
        var predicate = CourseSearchQuery
            .BuildWordPrefixPredicate("ru")
            .Compile();

        Assert.True(predicate(new KhoaHoc { LoaiKhoaHoc = "Chuyên đề Russian" }));
        Assert.False(predicate(new KhoaHoc { MoTa = "Nội dung Ruby thực hành" }));
        Assert.False(predicate(new KhoaHoc { MoTa = "Nội dung trung cấp" }));
    }

    [Fact]
    public void WordPrefix_SearchesDescriptionForLongerKeywords()
    {
        var predicate = CourseSearchQuery
            .BuildWordPrefixPredicate("ruby")
            .Compile();

        Assert.True(predicate(new KhoaHoc { MoTa = "Nội dung Ruby thực hành" }));
    }

    [Fact]
    public void WordPrefixPredicate_CanBeTranslatedBySqlServerProvider()
    {
        var options = new DbContextOptionsBuilder<EduverseContext>()
            .UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=EduverseQueryTest")
            .Options;
        using var context = new EduverseContext(options);

        var sql = context.Set<KhoaHoc>()
            .Where(CourseSearchQuery.BuildWordPrefixPredicate("ru"))
            .ToQueryString();

        Assert.Contains("LIKE", sql, StringComparison.OrdinalIgnoreCase);
    }
}
