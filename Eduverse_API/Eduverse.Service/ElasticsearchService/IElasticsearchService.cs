using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Eduverse.Service.ElasticsearchService
{
    public interface IElasticsearchService
    {
        Task InitializeIndexAsync();
        Task IndexCourseAsync(Guid courseId);
        Task DeleteCourseAsync(Guid courseId);
        Task BulkIndexAllCoursesAsync();
        Task<PagedList<KhoaHocDto>> SearchCoursesAsync(KhoaHocSearch search);
        Task<List<string>> GetSearchSuggestionsAsync(string query);
    }
}
