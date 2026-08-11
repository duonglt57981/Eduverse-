namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Exceptions
{
    public sealed class PhanCongKiemDuyetException : Exception
    {
        public PhanCongKiemDuyetException(int statusCode, string message, IEnumerable<Guid>? ids = null)
            : base(message)
        {
            StatusCode = statusCode;
            Ids = ids?.Select(x => x.ToString()).ToArray() ?? Array.Empty<string>();
        }

        public int StatusCode { get; }
        public IReadOnlyCollection<string> Ids { get; }
    }
}
