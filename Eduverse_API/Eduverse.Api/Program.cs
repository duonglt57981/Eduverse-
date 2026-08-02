
using BunnyCDN.Net.Storage;
using CloudinaryDotNet;
using CloudinaryDotNet;
using CloudinaryDotNet;
using Eduverse.Api.Hubs;
using Eduverse.Api.Services;
using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.AuthRepository;
using Eduverse.Repository.Common;
using Eduverse.Service.AuthService;
using Eduverse.Service.BunnyService;
using Eduverse.Service.BunnyService.Dto;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.CloudinaryService.Dto;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DangKyKhoaHocService;
using Eduverse.Service.ElasticsearchService;
using Eduverse.Service.EmailService;
using Eduverse.Service.GeminiService;
using Eduverse.Service.YeuCauRutTienService;
using Eduverse.Service.ThongBaoService;
using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;
using Xabe.FFmpeg;
using Xabe.FFmpeg.Downloader;

namespace Eduverse.Api
{
    public static class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddScoped<DbContext, EduverseContext>();
            builder.Services.AddDbContext<EduverseContext>(op => op.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
            builder.Services.AddIdentity<AppUser, AppRole>(options =>
            {
                options.User.AllowedUserNameCharacters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";

                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequiredLength = 8;

                // Lockout sau 5 lần sai
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
                options.Lockout.AllowedForNewUsers = true;

                // Bắt buộc xác thực email
                options.SignIn.RequireConfirmedEmail = false; // ← để false, check thủ công trong service
            }).AddEntityFrameworkStores<EduverseContext>().AddDefaultTokenProviders();
            // Đăng ký services
            builder.Services.AddScoped<IEmailService, EmailService>();
            builder.Services.AddScoped<IAuthRepository, AuthRepository>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IYeuCauRutTienService, YeuCauRutTienService>();
            builder.Services.AddScoped<INotificationPublisher, NotificationPublisher>();
            builder.Services.AddScoped<Eduverse.IService.DanhSachYeuThichService.IDanhSachYeuThichService, Eduverse.Service.DanhSachYeuThichService.DanhSachYeuThichService>();
            builder.Services.AddScoped<Eduverse.IService.ChungChiService.IChungChiService, Eduverse.IService.ChungChiService.ChungChiService>();
            builder.Services.AddDependencyInjection();
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddSignalR();
            builder.Services.AddSwaggerGen();
            builder.Services.AddAutoMapper(cfg =>
            {
                cfg.AddMaps(typeof(KhoaHoc).Assembly);
            });

            builder.Services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
                options.KnownProxies.Clear(); // hoặc thêm IP cụ thể của Nginx nếu muốn chặt chẽ
            });


            //Đăng ký MemoryCache
            builder.Services.AddMemoryCache();


            // Gemini
            builder.Services.AddScoped<IGeminiService, GeminiService>();

            // Cloudinary
            var cloudinarySettings = builder.Configuration.GetSection("Cloudinary");
            builder.Services.Configure<CloudinarySettings>(cloudinarySettings);

            var account = new Account(
                cloudinarySettings["CloudName"],
                cloudinarySettings["ApiKey"],
                cloudinarySettings["ApiSecret"]
            );

            var cloudinary = new Cloudinary(account);
            cloudinary.Api.Timeout = (int)TimeSpan.FromMinutes(30).TotalMilliseconds;

            var httpClient = new HttpClient
            {
                Timeout = TimeSpan.FromMinutes(30)
            };
            cloudinary.Api.Client = httpClient;

            builder.Services.AddSingleton(cloudinary);
            builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();

            // ================== BUNNY STREAM (video) ==================
            builder.Services.Configure<BunnyStreamSettings>(
                builder.Configuration.GetSection("BunnyStream"));

            builder.Services.AddHttpClient("BunnyStream", (sp, client) =>
            {
                var settings = sp.GetRequiredService<IOptions<BunnyStreamSettings>>().Value;
                client.BaseAddress = new Uri(settings.BaseUrl);      // https://video.bunnycdn.com
                client.DefaultRequestHeaders.Add("AccessKey", settings.ApiKey);
                client.Timeout = TimeSpan.FromMinutes(30);
            });

            builder.Services.AddScoped<IBunnyService, BunnyService>();

            // ================== BUNNY STORAGE ==================
            builder.Services.Configure<BunnyStorageSettings>(
                builder.Configuration.GetSection("BunnyStorage"));

            builder.Services.AddHttpClient("BunnyStorage", (sp, client) =>
            {
                var settings = sp.GetRequiredService<IOptions<BunnyStorageSettings>>().Value; // ✅ đổi type
                client.BaseAddress = new Uri(settings.BaseUrl);      // https://{region}.storage.bunnycdn.com
                client.DefaultRequestHeaders.Add("AccessKey", settings.ApiKey);
                client.Timeout = TimeSpan.FromMinutes(30);
            });

            builder.Services.AddSingleton(sp =>
            {
                var settings = sp.GetRequiredService<IOptions<BunnyStorageSettings>>().Value;
                return new BunnyCDNStorage(
                    settings.StorageZoneName,
                    settings.ApiKey,
                    settings.Region);
            });

            // ================== Hangfire ==================
            builder.Services.AddHangfire(config =>config.UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));
            builder.Services.AddHangfireServer();

            // PayOS chuyen khoan
            // Client payment
            var payOS = new PayOS.PayOSClient(
                builder.Configuration["PayOS:ClientId"] ?? "",
                builder.Configuration["PayOS:ApiKey"] ?? "",
                builder.Configuration["PayOS:ChecksumKey"] ?? ""
            );
            builder.Services.AddSingleton(payOS);
            // Client payout
            var payOSPayout = new PayOS.PayOSClient(
                builder.Configuration["PayOSPayout:ClientId"] ?? "",
                builder.Configuration["PayOSPayout:ApiKey"] ?? "",
                builder.Configuration["PayOSPayout:ChecksumKey"] ?? ""
            );
            builder.Services.AddKeyedSingleton<PayOS.PayOSClient>("payout", payOSPayout);

            // Form options
            builder.Services.Configure<FormOptions>(options =>
            {
                options.MultipartBodyLengthLimit = 2L * 1024 * 1024 * 1024;
                options.ValueLengthLimit = int.MaxValue;
                options.MultipartHeadersLengthLimit = int.MaxValue;
                options.BufferBodyLengthLimit = 2L * 1024 * 1024 * 1024;
            });

            // Kestrel
            builder.WebHost.ConfigureKestrel(options =>
            {
                options.Limits.MaxRequestBodySize = 2L * 1024 * 1024 * 1024;
                options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(30);
                options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(30);
            });


            // JWT
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ClockSkew = TimeSpan.Zero,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];

                        var path = context.HttpContext.Request.Path;

                        if (!string.IsNullOrEmpty(accessToken) &&
                            path.StartsWithSegments("/notificationHub"))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    },

                    OnTokenValidated = async context =>
                    {
                        var userManager = context.HttpContext.RequestServices
                            .GetRequiredService<UserManager<AppUser>>();

                        var userId = context.Principal!.FindFirstValue(ClaimTypes.NameIdentifier);
                        var sidInToken = context.Principal!.FindFirstValue("sid");

                        var user = await userManager.FindByIdAsync(userId!);
                        if (user is null || user.CurrentSessionId != sidInToken)
                        {
                            context.Fail("SESSION_REVOKED");
                        }
                    },

                    OnChallenge = async context =>
                    {
                        // Chặn hành vi mặc định (redirect/empty 401) để tự kiểm soát response
                        context.HandleResponse();

                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        context.Response.ContentType = "application/json";

                        var reason = context.HttpContext.Items["AuthFailReason"] as string;
                        var isSessionRevoked = reason == "SESSION_REVOKED";

                        var payload = System.Text.Json.JsonSerializer.Serialize(new
                        {
                            code = isSessionRevoked ? "SESSION_REVOKED" : "UNAUTHORIZED",
                            message = isSessionRevoked
                                ? "Tài khoản của bạn đã được đăng nhập ở một thiết bị khác."
                                : "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."
                        });

                        await context.Response.WriteAsync(payload);
                    }
                };
            });
            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization using the Bearer scheme. Example: Bearer {token}",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT"
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id   = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });
            //builder.Services.AddCors(opt =>
            //{
            //    opt.AddPolicy("AllowFrontend", policy =>
            //        policy.WithOrigins("http://localhost:3000") 
            //              .AllowAnyHeader()
            //              .AllowAnyMethod()
            //              .AllowCredentials()); 
            //});



            // Add services to the container.

            // CORS: cho phép frontend (đọc danh sách origin từ cấu hình AllowedOrigins).
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    var corsOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? System.Array.Empty<string>();
                    policy.WithOrigins(corsOrigins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {   
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
            });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            app.UseSwagger();
            app.UseSwaggerUI();

            // Hangfire
            app.UseHangfireDashboard();
            RecurringJob.AddOrUpdate<IDangKyKhoaHocService>(
                "expire-course",
                x => x.ExpireDangKyKhoaHocAsync(),
                Cron.Minutely);

            app.UseExceptionHandler(errApp =>
            {
                errApp.Run(async ctx =>
                {
                    ctx.Response.StatusCode = 400;
                    ctx.Response.ContentType = "application/json";

                    var ex = ctx.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
                    if (ex is not null)
                    {
                        var response = new
                        {
                            status = false,
                            message = ex.Error.Message,
                            data = (object?)null,
                            errors = (object?)null
                        };
                        await ctx.Response.WriteAsJsonAsync(response);
                    }
                });
            });
            app.UseCors("AllowFrontend");
            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();
            app.MapHub<NotificationHub>("/notificationHub");

            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<EduverseContext>();
                dbContext.Database.Migrate();

                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<AppRole>>();

                string[] roles = { "HocVien", "GiaoVien", "Admin" };
                foreach (var role in roles)
                {
                    if (!await roleManager.RoleExistsAsync(role))
                        await roleManager.CreateAsync(new AppRole { Name = role });
                }

                if (builder.Configuration.GetValue("Elasticsearch:SyncOnStartup", true))
                {
                    try
                    {
                        var elasticsearchService = scope.ServiceProvider
                            .GetRequiredService<IElasticsearchService>();
                        await elasticsearchService.BulkIndexAllCoursesAsync();
                    }
                    catch (Exception ex)
                    {
                        var logger = scope.ServiceProvider
                            .GetRequiredService<ILoggerFactory>()
                            .CreateLogger("ElasticsearchStartup");
                        logger.LogWarning(
                            ex,
                            "Elasticsearch is unavailable. Course search will use the database fallback.");
                    }
                }
            }

            // Đặt đường dẫn nơi bạn muốn lưu FFmpeg(ví dụ: thư mục của ứng dụng)
            string ffmpegPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ffmpeg");
            if (!Directory.Exists(ffmpegPath))
                Directory.CreateDirectory(ffmpegPath);

            // Kiểm tra nếu chưa có ffmpeg.exe thì tải về
            if (!File.Exists(Path.Combine(ffmpegPath, "ffmpeg.exe")))
            {
                Console.WriteLine("Đang tải FFmpeg...");
                await FFmpegDownloader.GetLatestVersion(FFmpegVersion.Official, ffmpegPath);
                Console.WriteLine("Tải FFmpeg thành công!");
            }

            // Cấu hình Xabe.FFmpeg sử dụng thư mục vừa tải
            FFmpeg.SetExecutablesPath(ffmpegPath);

            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            app.Run();
        }
        private static void AddDependencyInjection(this IServiceCollection services)
        {

            services.AddScoped<IMapper, Mapper>();
            services.AddScoped(typeof(Repository<>), typeof(Repository<>));
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            var repositoryTypes = typeof(Repository<>).Assembly.GetTypes()
                 .Where(x => !string.IsNullOrEmpty(x.Namespace) && x.Namespace.StartsWith("Eduverse.Repository") && x.Name.EndsWith("Repository"));
            foreach (var intf in repositoryTypes.Where(t => t.IsInterface))
            {
                var impl = repositoryTypes.FirstOrDefault(c => c.IsClass && intf.Name.Substring(1) == c.Name);
                if (impl != null) services.AddScoped(intf, impl);
            }

            services.AddScoped(typeof(IService<>), typeof(Service<>));
            var serviceTypes = typeof(IService<>).Assembly.GetTypes()
                 .Where(x => !string.IsNullOrEmpty(x.Namespace) && (x.Namespace.StartsWith("Eduverse.Service") || x.Namespace.StartsWith("Eduverse.IService")) && x.Name.EndsWith("Service"));
            foreach (var intf in serviceTypes.Where(t => t.IsInterface))
            {
                var impl = serviceTypes.FirstOrDefault(c => c.IsClass && intf.Name.Substring(1) == c.Name);
                if (impl != null) services.AddScoped(intf, impl);
            }
        }

    }


}
