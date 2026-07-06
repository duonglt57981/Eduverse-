
using CloudinaryDotNet;
using CloudinaryDotNet;
using CloudinaryDotNet;
using Eduverse.Api.Hubs;
using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.AuthRepository;
using Eduverse.Repository.Common;
using Eduverse.Service.AuthService;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.CloudinaryService.Dto;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.EmailService;
using Eduverse.Service.GeminiService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

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
            builder.Services.AddCors(opt =>
            {
                opt.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins("http://localhost:3000") 
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials()); 
            });



            // Add services to the container.

            builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
            });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
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
            app.UseCors(c =>
            {
                c.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>())
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();
            app.MapHub<NotificationHub>("/notificationHub");

            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<EduverseContext>();

                try
                {
                    dbContext.Database.ExecuteSqlRaw(@"
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'Message')
                            ALTER TABLE thongBaos ADD Message nvarchar(max) NOT NULL DEFAULT '.';
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'Link')
                            ALTER TABLE thongBaos ADD Link nvarchar(max) NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'FromUser')
                            ALTER TABLE thongBaos ADD FromUser uniqueidentifier NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'ToUser')
                            ALTER TABLE thongBaos ADD ToUser uniqueidentifier NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'IsRead')
                            ALTER TABLE thongBaos ADD IsRead bit NOT NULL DEFAULT 0;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'Type')
                            ALTER TABLE thongBaos ADD Type nvarchar(250) NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'SendToFrontEndUser')
                            ALTER TABLE thongBaos ADD SendToFrontEndUser bit NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'ItemId')
                            ALTER TABLE thongBaos ADD ItemId uniqueidentifier NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'ItemName')
                            ALTER TABLE thongBaos ADD ItemName nvarchar(max) NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'ItemType')
                            ALTER TABLE thongBaos ADD ItemType uniqueidentifier NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'IsDisplay')
                            ALTER TABLE thongBaos ADD IsDisplay bit NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'DonViId')
                            ALTER TABLE thongBaos ADD DonViId uniqueidentifier NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'Email')
                            ALTER TABLE thongBaos ADD Email nvarchar(max) NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'ProductId')
                            ALTER TABLE thongBaos ADD ProductId nvarchar(max) NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'ProductName')
                            ALTER TABLE thongBaos ADD ProductName nvarchar(max) NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'NguoiTao')
                            ALTER TABLE thongBaos ADD NguoiTao uniqueidentifier NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'FileDinhKem')
                            ALTER TABLE thongBaos ADD FileDinhKem nvarchar(max) NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('thongBaos') AND name = 'IsXuatBan')
                            ALTER TABLE thongBaos ADD IsXuatBan bit NULL;
                    ");
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error executing raw migration for thongBaos: " + ex.Message);
                }

                dbContext.Database.Migrate();

                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<AppRole>>();

                string[] roles = { "HocVien", "GiaoVien", "Admin" };
                foreach (var role in roles)
                {
                    if (!await roleManager.RoleExistsAsync(role))
                        await roleManager.CreateAsync(new AppRole { Name = role });
                }
            }
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
