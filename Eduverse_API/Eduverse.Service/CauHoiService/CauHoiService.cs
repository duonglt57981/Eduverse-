using Eduverse.IRepository.BaiGiang;
using Eduverse.IRepository.CauHoi;
using Eduverse.IService.Common;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.CauHoiService.Request;
using Eduverse.Service.Common;

namespace Eduverse.IService.CauHoi
{
    public class CauHoiService : Service<Model.Entities.CauHoi>, ICauHoiService
    {
        private readonly IBaiGiangRepository _baiGiangRepository;

        public CauHoiService(ICauHoiRepository repository, IBaiGiangRepository baiGiangRepository) : base(repository)
        {
            _baiGiangRepository = baiGiangRepository;
        }

        public Task<PagedList<CauHoiDto>> GetData(CauHoiSearch search)
        {
            var query = from q in GetQueryable()
                        select new CauHoiDto
                        {
                            Id = q.Id,
                            TenCauHoi = q.TenCauHoi,

                        };

            if (!string.IsNullOrEmpty(search.NoiDung))
            {
                query = query.Where(x => x.TenCauHoi.Contains(search.NoiDung));
            }
            var result = PagedList<CauHoiDto>.CreateAsync(query, search);

            return result;


        }
    }
}
