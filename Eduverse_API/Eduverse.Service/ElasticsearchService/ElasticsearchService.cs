using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.Mapping;
using Elastic.Clients.Elasticsearch.QueryDsl;
using Elastic.Transport.Products.Elasticsearch;
using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.ElasticsearchService.Dto;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Eduverse.Service.ElasticsearchService
{
    public class ElasticsearchService : IElasticsearchService
    {
        private const string IndexName = "khoahoc";
        private const string VietnameseAnalyzer = "vietnamese_analyzer";

        private readonly ElasticsearchClient _client;
        private readonly EduverseContext _dbContext;

        public ElasticsearchService(IConfiguration configuration, EduverseContext dbContext)
        {
            _dbContext = dbContext;

            var url = configuration["Elasticsearch:Url"];
            if (string.IsNullOrWhiteSpace(url))
            {
                url = "http://localhost:9200";
            }

            var settings = new ElasticsearchClientSettings(new Uri(url))
                .DefaultIndex(IndexName)
                .RequestTimeout(TimeSpan.FromSeconds(15));

            _client = new ElasticsearchClient(settings);
        }

        public async Task InitializeIndexAsync()
        {
            var existsResponse = await _client.Indices.ExistsAsync(IndexName);
            if (!existsResponse.IsSuccess())
            {
                throw CreateElasticsearchException("Không thể kiểm tra Elasticsearch", existsResponse);
            }

            if (existsResponse.Exists)
            {
                return;
            }

            await CreateIndexAsync();
        }

        public async Task IndexCourseAsync(Guid courseId)
        {
            await InitializeIndexAsync();

            var course = await _dbContext.Set<KhoaHoc>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == courseId);

            if (!IsSearchable(course))
            {
                await DeleteCourseAsync(courseId);
                return;
            }

            var document = await BuildDocumentAsync(course!);
            var response = await _client.IndexAsync(document, descriptor => descriptor
                .Index(IndexName)
                .Id(courseId.ToString()));

            if (!response.IsSuccess())
            {
                throw CreateElasticsearchException(
                    $"Không thể cập nhật khóa học {courseId} vào Elasticsearch",
                    response);
            }
        }

        public async Task DeleteCourseAsync(Guid courseId)
        {
            var existsResponse = await _client.Indices.ExistsAsync(IndexName);
            if (!existsResponse.IsSuccess())
            {
                throw CreateElasticsearchException("Không thể kiểm tra Elasticsearch", existsResponse);
            }

            if (!existsResponse.Exists)
            {
                return;
            }

            var response = await _client.DeleteAsync<KhoaHocSearchDocument>(
                courseId.ToString(),
                descriptor => descriptor.Index(IndexName));

            var statusCode = response.ApiCallDetails?.HttpStatusCode;
            if (!response.IsSuccess() && statusCode != 404)
            {
                throw CreateElasticsearchException(
                    $"Không thể xóa khóa học {courseId} khỏi Elasticsearch",
                    response);
            }
        }

        public async Task BulkIndexAllCoursesAsync()
        {
            var existsResponse = await _client.Indices.ExistsAsync(IndexName);
            if (!existsResponse.IsSuccess())
            {
                throw CreateElasticsearchException("Không thể kết nối Elasticsearch", existsResponse);
            }

            if (existsResponse.Exists)
            {
                var deleteResponse = await _client.Indices.DeleteAsync(IndexName);
                if (!deleteResponse.IsSuccess())
                {
                    throw CreateElasticsearchException("Không thể tạo lại index Elasticsearch", deleteResponse);
                }
            }

            await CreateIndexAsync();

            var activeCourses = await _dbContext.Set<KhoaHoc>()
                .AsNoTracking()
                .Where(x =>
                    !x.IsDeleted &&
                    x.IsBanHienTai &&
                    x.TrangThai == "HoatDong" &&
                    x.TrangThaiPheDuyet == "DaDuyet" &&
                    !_dbContext.Set<KhoaHoc>().Any(next =>
                        !next.IsDeleted &&
                        next.IdBanGhiTruoc == x.Id &&
                        next.TrangThai == "HoatDong" &&
                        next.TrangThaiPheDuyet == "DaDuyet"))
                .Select(x => x.Id)
                .ToListAsync();

            foreach (var courseId in activeCourses)
            {
                await IndexCourseAsync(courseId);
            }

            var refreshResponse = await _client.Indices.RefreshAsync(IndexName);
            if (!refreshResponse.IsSuccess())
            {
                throw CreateElasticsearchException("Không thể làm mới index Elasticsearch", refreshResponse);
            }
        }

        public async Task<PagedList<KhoaHocDto>> SearchCoursesAsync(KhoaHocSearch search)
        {
            search ??= new KhoaHocSearch();
            await InitializeIndexAsync();

            var pageIndex = Math.Max(1, search.PageIndex);
            var pageSize = search.PageSize == -1
                ? 10_000
                : Math.Clamp(search.PageSize, 1, 1_000);

            var mustQueries = new List<Query>();
            var filterQueries = new List<Query>
            {
                new TermQuery(new Field("trangThai")) { Value = "HoatDong" },
                new TermQuery(new Field("trangThaiPheDuyet")) { Value = "DaDuyet" },
                new TermQuery(new Field("isBanHienTai")) { Value = true }
            };

            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                mustQueries.Add(new MultiMatchQuery
                {
                    Query = search.Keyword.Trim(),
                    Fields = new[]
                    {
                        "tieuDe^4",
                        "tenDanhMucList^2",
                        "tenGiangVien^2",
                        "moTa"
                    },
                    Fuzziness = new Fuzziness("AUTO")
                });
            }

            if (!string.IsNullOrWhiteSpace(search.TieuDe))
            {
                mustQueries.Add(new MatchQuery(new Field("tieuDe"))
                {
                    Query = search.TieuDe.Trim()
                });
            }

            if (!string.IsNullOrWhiteSpace(search.LoaiKhoaHoc))
            {
                filterQueries.Add(new TermQuery(new Field("loaiKhoaHoc"))
                {
                    Value = search.LoaiKhoaHoc.Trim()
                });
            }

            if (search.DanhMucId.HasValue)
            {
                filterQueries.Add(new TermQuery(new Field("danhMucIds"))
                {
                    Value = search.DanhMucId.Value.ToString()
                });
            }

            if (!string.IsNullOrWhiteSpace(search.CapDo))
            {
                filterQueries.Add(new TermQuery(new Field("capDo"))
                {
                    Value = search.CapDo.Trim()
                });
            }

            if (search.IsFree == true)
            {
                filterQueries.Add(new TermQuery(new Field("isFree")) { Value = true });
            }
            else if (search.GiaFrom.HasValue || search.GiaTo.HasValue)
            {
                filterQueries.Add(new NumberRangeQuery("gia")
                {
                    Gte = search.GiaFrom,
                    Lte = search.GiaTo
                });
            }

            if (search.TongBaiGiangFrom.HasValue || search.TongBaiGiangTo.HasValue)
            {
                filterQueries.Add(new NumberRangeQuery("tongBaiGiang")
                {
                    Gte = search.TongBaiGiangFrom,
                    Lte = search.TongBaiGiangTo
                });
            }

            var mustNotQueries = (search.ExcludeCourseIds ?? new List<Guid>())
                .Select(id => (Query)new TermQuery(new Field("id"))
                {
                    Value = id.ToString()
                })
                .ToList();

            var searchRequest = new SearchRequest(IndexName)
            {
                From = (pageIndex - 1) * pageSize,
                Size = pageSize,
                Query = new BoolQuery
                {
                    Must = mustQueries.Count > 0 ? mustQueries : null,
                    Filter = filterQueries,
                    MustNot = mustNotQueries.Count > 0 ? mustNotQueries : null
                }
            };

            var sortOptions = new List<SortOptions>();
            if (string.Equals(search.SortPrice, "asc", StringComparison.OrdinalIgnoreCase))
            {
                sortOptions.Add(SortOptions.Field("gia", new FieldSort { Order = SortOrder.Asc }));
            }
            else if (string.Equals(search.SortPrice, "desc", StringComparison.OrdinalIgnoreCase))
            {
                sortOptions.Add(SortOptions.Field("gia", new FieldSort { Order = SortOrder.Desc }));
            }
            else
            {
                if (mustQueries.Count > 0)
                {
                    sortOptions.Add(SortOptions.Field("_score", new FieldSort { Order = SortOrder.Desc }));
                }

                sortOptions.Add(SortOptions.Field("ngayTao", new FieldSort { Order = SortOrder.Desc }));
            }

            searchRequest.Sort = sortOptions;

            var response = await _client.SearchAsync<KhoaHocSearchDocument>(searchRequest);
            if (!response.IsSuccess())
            {
                throw CreateElasticsearchException("Truy vấn Elasticsearch thất bại", response);
            }

            var totalCount = response.Total > int.MaxValue
                ? int.MaxValue
                : (int)response.Total;

            var courseIds = response.Documents
                .Select(document => document.Id)
                .Distinct()
                .ToList();

            var studentCounts = courseIds.Count == 0
                ? new Dictionary<Guid, int>()
                : await _dbContext.dangKyKhoaHocs
                    .AsNoTracking()
                    .Where(registration =>
                        registration.IdKhoaHoc.HasValue &&
                        courseIds.Contains(registration.IdKhoaHoc.Value) &&
                        !registration.IsDeleted &&
                        registration.IsDangKy != false &&
                        registration.IdNguoiDangKi.HasValue)
                    .GroupBy(registration => registration.IdKhoaHoc!.Value)
                    .Select(group => new
                    {
                        CourseId = group.Key,
                        Count = group
                            .Select(registration => registration.IdNguoiDangKi)
                            .Distinct()
                            .Count()
                    })
                    .ToDictionaryAsync(item => item.CourseId, item => item.Count);

            var items = response.Documents.Select(document => new KhoaHocDto
            {
                Id = document.Id,
                TieuDe = document.TieuDe,
                MoTa = document.MoTa,
                Gia = document.Gia,
                GiaGoc = document.GiaGoc,
                LoaiKhoaHoc = document.LoaiKhoaHoc,
                HinhAnhKhoaHoc = document.HinhAnhKhoaHoc,
                CapDo = document.CapDo,
                TongThoiLuong = document.TongThoiLuong,
                TongBaiGiang = document.TongBaiGiang,
                SoLuongHocVien = studentCounts.GetValueOrDefault(document.Id),
                NgayTao = document.NgayTao,
                TrangThai = document.TrangThai,
                TrangThaiPheDuyet = document.TrangThaiPheDuyet,
                IsBanHienTai = document.IsBanHienTai,
                CreatedBy = document.TenGiangVien,
                DaDangKy = false
            }).ToList();

            return new PagedList<KhoaHocDto>(
                items,
                search.PageSize == -1 ? 1 : pageIndex,
                search.PageSize == -1 ? Math.Max(totalCount, 1) : pageSize,
                totalCount);
        }

        public async Task<List<string>> GetSearchSuggestionsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return new List<string>();
            }

            await InitializeIndexAsync();

            var request = new SearchRequest(IndexName)
            {
                Size = 10,
                Query = new BoolQuery
                {
                    Must = new List<Query>
                    {
                        new MatchPhrasePrefixQuery(new Field("tieuDe"))
                        {
                            Query = query.Trim()
                        }
                    },
                    Filter = new List<Query>
                    {
                        new TermQuery(new Field("trangThai")) { Value = "HoatDong" },
                        new TermQuery(new Field("trangThaiPheDuyet")) { Value = "DaDuyet" },
                        new TermQuery(new Field("isBanHienTai")) { Value = true }
                    }
                }
            };

            var response = await _client.SearchAsync<KhoaHocSearchDocument>(request);
            if (!response.IsSuccess())
            {
                throw CreateElasticsearchException("Không thể lấy gợi ý tìm kiếm", response);
            }

            return response.Documents
                .Select(x => x.TieuDe?.Trim())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(10)
                .Cast<string>()
                .ToList();
        }

        private async Task CreateIndexAsync()
        {
            var response = await _client.Indices.CreateAsync(IndexName, descriptor => descriptor
                .Settings(settings => settings
                    .Analysis(analysis => analysis
                        .Analyzers(analyzers => analyzers
                            .Custom(VietnameseAnalyzer, analyzer => analyzer
                                .Tokenizer("standard")
                                .Filter(new[] { "lowercase", "asciifolding" })))))
                .Mappings(mapping => mapping
                    .Properties(new Properties
                    {
                        { "id", new KeywordProperty() },
                        { "tieuDe", new TextProperty { Analyzer = VietnameseAnalyzer } },
                        { "moTa", new TextProperty { Analyzer = VietnameseAnalyzer } },
                        { "loaiKhoaHoc", new KeywordProperty() },
                        { "hinhAnhKhoaHoc", new KeywordProperty { Index = false } },
                        { "capDo", new KeywordProperty() },
                        { "gia", new DoubleNumberProperty() },
                        { "giaGoc", new DoubleNumberProperty() },
                        { "tongThoiLuong", new IntegerNumberProperty() },
                        { "tongBaiGiang", new IntegerNumberProperty() },
                        { "soLuongHocVien", new IntegerNumberProperty() },
                        { "trangThaiPheDuyet", new KeywordProperty() },
                        { "trangThai", new KeywordProperty() },
                        { "isBanHienTai", new BooleanProperty() },
                        { "isFree", new BooleanProperty() },
                        { "tenGiangVien", new TextProperty { Analyzer = VietnameseAnalyzer } },
                        { "danhMucIds", new KeywordProperty() },
                        { "tenDanhMucList", new TextProperty { Analyzer = VietnameseAnalyzer } },
                        { "ngayTao", new DateProperty() }
                    })));

            if (!response.IsSuccess())
            {
                throw CreateElasticsearchException("Không thể tạo index Elasticsearch", response);
            }
        }

        private async Task<KhoaHocSearchDocument> BuildDocumentAsync(KhoaHoc course)
        {
            var instructorName = string.Empty;
            if (course.CreatedId.HasValue)
            {
                instructorName = await _dbContext.Users
                    .AsNoTracking()
                    .Where(x => x.Id == course.CreatedId.Value)
                    .Select(x => x.HoTen ?? string.Empty)
                    .FirstOrDefaultAsync() ?? string.Empty;
            }

            var categories = await (
                from link in _dbContext.danhMuc_KhoaHocs.AsNoTracking()
                join category in _dbContext.danhMucs.AsNoTracking()
                    on link.IdDanhMuc equals category.Id
                where link.IdKhoaHoc == course.Id &&
                      !link.IsDeleted &&
                      !category.IsDeleted
                select new
                {
                    category.Id,
                    category.TenDanhMuc
                })
                .ToListAsync();

            var studentCount = await _dbContext.dangKyKhoaHocs
                .AsNoTracking()
                .Where(registration =>
                    registration.IdKhoaHoc == course.Id &&
                    !registration.IsDeleted &&
                    registration.IsDangKy != false &&
                    registration.IdNguoiDangKi.HasValue)
                .Select(registration => registration.IdNguoiDangKi)
                .Distinct()
                .CountAsync();

            return new KhoaHocSearchDocument
            {
                Id = course.Id,
                TieuDe = course.TieuDe,
                MoTa = course.MoTa,
                Gia = course.Gia,
                GiaGoc = course.GiaGoc,
                LoaiKhoaHoc = course.LoaiKhoaHoc,
                HinhAnhKhoaHoc = course.HinhAnhKhoaHoc,
                CapDo = course.CapDo,
                TongThoiLuong = course.TongThoiLuong,
                TongBaiGiang = course.TongBaiGiang,
                SoLuongHocVien = studentCount,
                NgayTao = course.NgayTao,
                TrangThaiPheDuyet = course.TrangThaiPheDuyet,
                TrangThai = course.TrangThai,
                IsBanHienTai = course.IsBanHienTai,
                IsFree = !course.Gia.HasValue || course.Gia.Value <= 0,
                TenGiangVien = instructorName,
                DanhMucIds = categories.Select(x => x.Id).Distinct().ToList(),
                TenDanhMucList = categories
                    .Select(x => x.TenDanhMuc?.Trim())
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .Cast<string>()
                    .ToList()
            };
        }

        private static bool IsSearchable(KhoaHoc? course)
        {
            return course != null &&
                   !course.IsDeleted &&
                   course.IsBanHienTai &&
                   course.TrangThai == "HoatDong" &&
                   course.TrangThaiPheDuyet == "DaDuyet";
        }

        private static Exception CreateElasticsearchException(
            string message,
            ElasticsearchResponse response)
        {
            var reason = response.ElasticsearchServerError?.Error.Reason;
            return new InvalidOperationException(
                string.IsNullOrWhiteSpace(reason) ? message : $"{message}: {reason}");
        }
    }
}
