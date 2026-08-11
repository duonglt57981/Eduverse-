using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Exceptions;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Validate;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace Eduverse.Tests;

public class PhanCongKiemDuyetValidatorTests
{
    [Fact]
    public void NormalizeCourseIds_RejectsNullOrEmptyLists()
    {
        var nullError = Assert.Throws<PhanCongKiemDuyetException>(
            () => PhanCongKiemDuyetValidator.NormalizeCourseIds(null));
        var emptyError = Assert.Throws<PhanCongKiemDuyetException>(
            () => PhanCongKiemDuyetValidator.NormalizeCourseIds(Array.Empty<Guid>()));

        Assert.Equal(StatusCodes.Status400BadRequest, nullError.StatusCode);
        Assert.Equal(StatusCodes.Status400BadRequest, emptyError.StatusCode);
    }

    [Fact]
    public void NormalizeCourseIds_RemovesDuplicatesWithoutChangingOrder()
    {
        var first = Guid.NewGuid();
        var second = Guid.NewGuid();

        var result = PhanCongKiemDuyetValidator.NormalizeCourseIds(
            new[] { first, second, first });

        Assert.Equal(new[] { first, second }, result);
    }

    [Fact]
    public void NormalizeCourseIds_RejectsEmptyGuid()
    {
        var error = Assert.Throws<PhanCongKiemDuyetException>(
            () => PhanCongKiemDuyetValidator.NormalizeCourseIds(new[] { Guid.Empty }));

        Assert.Equal(StatusCodes.Status400BadRequest, error.StatusCode);
    }

    [Fact]
    public void NormalizeCourseIds_RejectsMoreThanOneHundredIds()
    {
        var ids = Enumerable.Range(0, PhanCongKiemDuyetValidator.MaxCourseIds + 1)
            .Select(_ => Guid.NewGuid())
            .ToArray();

        var error = Assert.Throws<PhanCongKiemDuyetException>(
            () => PhanCongKiemDuyetValidator.NormalizeCourseIds(ids));

        Assert.Equal(StatusCodes.Status400BadRequest, error.StatusCode);
    }
}
