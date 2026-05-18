namespace Hinet.Api.Dto
{
    public class DataResponse<T>
    {
        public string? Message { get; set; }
        public T? Data { get; set; }
        public bool Status { get; set; }
        public IEnumerable<string?>? Errors { get; set; }

        public static DataResponse<T> False(string message, IEnumerable<string>? errors = null)
        {
            return new DataResponse<T>()
            {
                Status = false,
                Message = message,
                Errors = errors,
            };
        }
        public static DataResponse<T> Success(T? data, string message = "Success", IEnumerable<string>? errors = null)
        {
            return new DataResponse<T>()
            {
                Status = true,
                Data = data,
                Message = message,
                Errors = errors,
            };
        }
    }

    public class DataResponse : DataResponse<object>
    {
        public static new DataResponse False(string message, IEnumerable<string>? errors = null)
        {
            return new DataResponse()
            {
                Status = false,
                Message = message,
                Errors = errors,
            };
        }
        public static new DataResponse Success(object? data, string message = "Success", IEnumerable<string>? errors = null)
        {
            return new DataResponse()
            {
                Status = true,
                Data = data,
                Message = message,
                Errors = errors,
            };
        }
    }


}
