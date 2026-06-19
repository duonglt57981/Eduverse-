using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Exceptions;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Middleware
{
    public class KiemDuyetMiddleware
    {
        private readonly RequestDelegate _next;

        public KiemDuyetMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ILichSuKiemDuyetKhoaHocService kiemDuyetService)
        {
            // Chi kiem tra POST, PUT, PATCH
            if (context.Request.Method == "POST" ||
                context.Request.Method == "PUT" ||
                context.Request.Method == "PATCH")
            {
                context.Request.EnableBuffering();
                var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
                context.Request.Body.Position = 0;

                if (!string.IsNullOrEmpty(body))
                {
                    var noiDung = TrichXuatNoiDung(body);

                    if (!string.IsNullOrEmpty(noiDung))
                    {
                        try
                        {
                            await kiemDuyetService.KiemTraVaNemExceptionAsync(noiDung);
                        }
                        catch (KiemDuyetException ex)
                        {
                            context.Response.StatusCode = 400;
                            context.Response.ContentType = "application/json";

                            var response = new
                            {
                                success = false,
                                error = ex.Message,
                                loai = ex.Loai,
                                tuViPham = ex.TuViPham,
                                goiYSua = ex.GoiYSua
                            };

                            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                            return;
                        }
                    }
                }
            }

            await _next(context);
        }

        private string TrichXuatNoiDung(string body)
        {
            try
            {
                using var doc = JsonDocument.Parse(body);
                var root = doc.RootElement;

                var cacTruong = new[] { "tenPhan", "noiDung", "content", "text", "title", "tieuDe", "moTa", "description" };

                foreach (var truong in cacTruong)
                {
                    if (root.TryGetProperty(truong, out var element))
                    {
                        var value = element.GetString();
                        if (!string.IsNullOrWhiteSpace(value)) return value;
                    }
                }

                return null;
            }
            catch
            {
                return null;
            }
        }
    }
}
