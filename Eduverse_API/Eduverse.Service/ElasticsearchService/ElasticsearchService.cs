using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.QueryDsl;
using Elastic.Clients.Elasticsearch.Mapping;
using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.ElasticsearchService.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Eduverse.Service.ElasticsearchService
{
    public class ElasticsearchService : IElasticsearchService
    {
        private readonly ElasticsearchClient _client;
        private readonly EduverseContext _dbContext;
        private const string IndexName = "khoahoc";

        public ElasticsearchService(IConfiguration configuration, EduverseContext dbContext)
        {
            _dbContext = dbContext;
            var url = configuration["Elasticsearch:Url"] ?? "http://localhost:9200";
            var settings = new ElasticsearchClientSettings(new Uri(url))
                .DefaultIndex(IndexName);
            _client = new ElasticsearchClient(settings);
        }

        public async Task InitializeIndexAsync()
        {
            var existsResponse = await _client.Indices.ExistsAsync(IndexName);
            if (existsResponse.Exists)
            {
                await _client.Indices.DeleteAsync(IndexName);
            }

            var createResponse = await _client.Indices.CreateAsync(IndexName, c => c
                .Settings(s => s
                    .Analysis(a => a
                        .Analyzers(analyzers => analyzers
                            .Custom("vietnamese_analyzer", ca => ca
                                .Tokenizer("standard")
                                .Filter(new[] { "lowercase", "asciifolding" })
                            )
                        )
                    )
                )
                .Mappings(m => m
                    .Properties(new Properties
                    {
                        { "tieuDe", new TextProperty { Analyzer = "vietnamese_analyzer" } },
                        { "moTa", new TextProperty { Analyzer = "vietnamese_analyzer" } },
                        { "loaiKhoaHoc", new TextProperty { Analyzer = "vietnamese_analyzer" } },
                        { "capDo", new KeywordProperty() },
                        { "gia", new DoubleNumberProperty() },
                        { "giaGoc", new DoubleNumberProperty() },
                        { "tongThoiLuong", new IntegerNumberProperty() },
                        { "tongBaiGiang", new IntegerNumberProperty() },
                        { "soLuongHocVien", new IntegerNumberProperty() },
                        { "trangThaiPheDuyet", new KeywordProperty() },
                        { "trangThai", new KeywordProperty() },
                        { "isFree", new BooleanProperty() },
                        { "tenGiangVien", new TextProperty { Analyzer = "vietnamese_analyzer" } },
                        { "danhMucIds", new KeywordProperty() },
                        { "tenDanhMucList", new TextProperty { Analyzer = "vietnamese_analyzer" } },
                        { "ngayTao", new DateProperty() }
                    })
                )
            );

            if (!createResponse.IsSuccess())
            {
                throw new Exception($"Failed to create Elasticsearch index: {createResponse.ElasticsearchServerError?.Error.Reason}");
            }
        }

        public async Task IndexCourseAsync(Guid courseId)
        {
            var course = await _dbContext.Set<KhoaHoc>()
                .AsNoTracking()
                .FirstOrDefaultAsync(kh => kh.Id == courseId && !kh.IsDeleted);

            if (course == null) return;

            var instructorName = "";
            if (course.CreatedId.HasValue)
            {
                var user = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == course.CreatedId.Value);
                instructorName = user?.HoTen ?? "";
            }

            var dmkhs = await _dbContext.danhMuc_KhoaHocs
                .AsNoTracking()
                .Where(x => x.IdKhoaHoc == courseId && !x.IsDeleted)
                .ToListAsync();

            var dmIds = dmkhs.Select(x => x.IdDanhMuc).ToList();
            var danhMucs = await _dbContext.danhMucs
                .AsNoTracking()
                .Where(x => dmIds.Contains(x.Id) && !x.IsDeleted)
                .ToListAsync();

            var doc = new KhoaHocSearchDocument
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
                SoLuongHocVien = course.SoLuongHocVien,
                NgayTao = course.NgayTao,
                TrangThaiPheDuyet = course.TrangThaiPheDuyet,
                TrangThai = course.TrangThai,
                IsFree = course.Gia == 0,
                TenGiangVien = instructorName,
                DanhMucIds = dmIds,
                TenDanhMucList = danhMucs.Select(x => x.TenDanhMuc ?? "").Where(x => !string.IsNullOrEmpty(x)).ToList()
            };

            await _client.IndexAsync(doc, idx => idx.Id(courseId.ToString()));
        }

        public async Task DeleteCourseAsync(Guid courseId)
        {
            await _client.DeleteAsync<KhoaHocSearchDocument>(courseId.ToString());
        }

        public async Task BulkIndexAllCoursesAsync()
        {
            await InitializeIndexAsync();

            var activeCourses = await _dbContext.Set<KhoaHoc>()
                .AsNoTracking()
                .Where(kh => !kh.IsDeleted)
                .ToListAsync();

            foreach (var course in activeCourses)
            {
                await IndexCourseAsync(course.Id);
            }
        }

        public async Task<PagedList<KhoaHocDto>> SearchCoursesAsync(KhoaHocSearch search)
        {
            search ??= new KhoaHocSearch();

            var mustQueries = new List<Query>();
            var filterQueries = new List<Query>();

            // Only show active and approved courses
            filterQueries.Add(new TermQuery(new Field("trangThai")) { Value = "HoatDong" });
            filterQueries.Add(new TermQuery(new Field("trangThaiPheDuyet")) { Value = "DaDuyet" });

            // Keyword Search (Vietnamese full-text matching)
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var queryStr = search.Keyword.Trim();
                mustQueries.Add(new MultiMatchQuery
                {
                    Query = queryStr,
                    Fields = new[] { "tieuDe^3", "moTa", "loaiKhoaHoc", "tenGiangVien", "tenDanhMucList" },
                    Fuzziness = new Fuzziness("AUTO")
                });
            }

            if (!string.IsNullOrWhiteSpace(search.TieuDe))
            {
                mustQueries.Add(new MatchQuery(new Field("tieuDe")) { Query = search.TieuDe.Trim() });
            }

            // Category filter
            if (!string.IsNullOrWhiteSpace(search.LoaiKhoaHoc))
            {
                filterQueries.Add(new TermQuery(new Field("loaiKhoaHoc")) { Value = search.LoaiKhoaHoc });
            }

            // Level filter
            if (!string.IsNullOrWhiteSpace(search.CapDo))
            {
                filterQueries.Add(new TermQuery(new Field("capDo")) { Value = search.CapDo });
            }

            // Price filter (Free/Paid range)
            if (search.IsFree == true)
            {
                filterQueries.Add(new TermQuery(new Field("isFree")) { Value = true });
            }
            else
            {
                if (search.GiaFrom.HasValue || search.GiaTo.HasValue)
                {
                    filterQueries.Add(new NumberRangeQuery("gia")
                    {
                        Gte = search.GiaFrom,
                        Lte = search.GiaTo
                    });
                }
            }

            // Lecture count range filter
            if (search.TongBaiGiangFrom.HasValue || search.TongBaiGiangTo.HasValue)
            {
                filterQueries.Add(new NumberRangeQuery("tongBaiGiang")
                {
                    Gte = (double?)search.TongBaiGiangFrom,
                    Lte = (double?)search.TongBaiGiangTo
                });
            }

            var mustNotQueries = new List<Query>();
            if (search.ExcludeCourseIds != null && search.ExcludeCourseIds.Any())
            {
                foreach (var id in search.ExcludeCourseIds)
                {
                    mustNotQueries.Add(new TermQuery(new Field("id")) { Value = id.ToString().ToLower() });
                }
            }

            var searchRequest = new SearchRequest(IndexName)
            {
                From = (search.PageIndex - 1) * search.PageSize,
                Size = search.PageSize,
                Query = new BoolQuery
                {
                    Must = mustQueries,
                    Filter = filterQueries,
                    MustNot = mustNotQueries
                }
            };

            // Sorting
            var sortOptions = new List<SortOptions>();
            if (search.SortPrice?.ToLower() == "asc")
            {
                sortOptions.Add(SortOptions.Field("gia", new FieldSort { Order = SortOrder.Asc }));
            }
            else if (search.SortPrice?.ToLower() == "desc")
            {
                sortOptions.Add(SortOptions.Field("gia", new FieldSort { Order = SortOrder.Desc }));
            }
            else
            {
                sortOptions.Add(SortOptions.Field("_score", new FieldSort { Order = SortOrder.Desc }));
                sortOptions.Add(SortOptions.Field("ngayTao", new FieldSort { Order = SortOrder.Desc }));
            }

            searchRequest.Sort = sortOptions;

            var response = await _client.SearchAsync<KhoaHocSearchDocument>(searchRequest);

            if (!response.IsSuccess())
            {
                throw new Exception($"Elasticsearch query failed: {response.ElasticsearchServerError?.Error.Reason}");
            }

            var totalCount = (int)response.Total;
            var listItems = response.Documents.Select(doc => new KhoaHocDto
            {
                Id = doc.Id,
                TieuDe = doc.TieuDe,
                MoTa = doc.MoTa,
                Gia = doc.Gia,
                GiaGoc = doc.GiaGoc,
                LoaiKhoaHoc = doc.LoaiKhoaHoc,
                HinhAnhKhoaHoc = doc.HinhAnhKhoaHoc,
                CapDo = doc.CapDo,
                TongThoiLuong = doc.TongThoiLuong,
                TongBaiGiang = doc.TongBaiGiang,
                SoLuongHocVien = doc.SoLuongHocVien,
                NgayTao = doc.NgayTao,
                TrangThai = doc.TrangThai,
                TrangThaiPheDuyet = doc.TrangThaiPheDuyet,
                DaDangKy = false
            }).ToList();

            return new PagedList<KhoaHocDto>(listItems, search.PageIndex, search.PageSize, totalCount);
        }

        public async Task<List<string>> GetSearchSuggestionsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return new List<string>();

            var searchRequest = new SearchRequest(IndexName)
            {
                Size = 10,
                Query = new MatchPhrasePrefixQuery(new Field("tieuDe"))
                {
                    Query = query.Trim()
                }
            };

            var response = await _client.SearchAsync<KhoaHocSearchDocument>(searchRequest);

            if (!response.IsSuccess()) return new List<string>();

            return response.Documents
                .Select(d => d.TieuDe)
                .Where(t => !string.IsNullOrEmpty(t))
                .Distinct()
                .ToList()!;
        }
    }
}
