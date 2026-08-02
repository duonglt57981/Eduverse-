namespace Eduverse.Service.SmsService
{
    /// <summary>
    /// Dịch vụ gửi tin nhắn SMS.
    /// Giữ cùng khuôn mẫu với IEmailService để tầng nghiệp vụ không phụ thuộc
    /// vào nhà cung cấp cụ thể — muốn đổi sang eSMS, SpeedSMS hay Twilio
    /// chỉ cần thay bản triển khai, không phải sửa AuthService.
    /// </summary>
    public interface ISmsService
    {
        /// <summary>
        /// Gửi một tin nhắn tới số điện thoại. Ném ngoại lệ nếu gửi thất bại.
        /// </summary>
        /// <param name="phoneNumber">Số điện thoại người nhận (dạng 0xxxxxxxxx hoặc +84xxxxxxxxx).</param>
        /// <param name="message">Nội dung tin nhắn, nên viết không dấu để tránh bị tính thành nhiều tin.</param>
        Task SendAsync(string phoneNumber, string message);

        /// <summary>
        /// Cho biết dịch vụ đã được cấu hình khóa thật hay chưa.
        /// Khi false, hệ thống đang chạy ở chế độ ghi log (mã OTP in ra console).
        /// </summary>
        bool IsLiveMode { get; }
    }
}
