using Eduverse.Service.ElasticsearchService;
using Xunit;

namespace Eduverse.Tests;

public class CourseSearchVocabularyTests
{
    [Fact]
    public void JavascriptAbbreviation_ExpandsToCourseTechnologyName()
    {
        var variants = CourseSearchVocabulary.GetSearchVariants("js");

        Assert.Equal("js", variants[0]);
        Assert.Contains("javascript", variants);
        Assert.Contains("ecmascript", variants);
    }

    [Fact]
    public void AbbreviationInsideAQuery_IsExpandedWithoutLosingOtherWords()
    {
        var variants = CourseSearchVocabulary.GetSearchVariants("Lập trình JS cơ bản");

        Assert.Contains("lap trinh javascript co ban", variants);
    }

    [Theory]
    [InlineData("AI", "artificial intelligence")]
    [InlineData("trí tuệ nhân tạo", "ai")]
    [InlineData("k8s", "kubernetes")]
    [InlineData("C#", "dotnet")]
    [InlineData("cơ sở dữ liệu", "db")]
    public void CommonCourseTerms_AreExpandedBidirectionally(string keyword, string expected)
    {
        var variants = CourseSearchVocabulary.GetSearchVariants(keyword);

        Assert.Contains(expected, variants);
    }

    [Fact]
    public void Alias_IsOnlyExpandedAsAWholeTerm()
    {
        var variants = CourseSearchVocabulary.GetSearchVariants("design");

        Assert.Single(variants);
        Assert.DoesNotContain("artificial intelligence", variants);
    }
}
