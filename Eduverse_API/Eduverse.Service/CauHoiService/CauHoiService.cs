using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.CauHoiRepository;
using Eduverse.Service.Common;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.CauHoiService.Request;
namespace Eduverse.Service.CauHoiService
{
    public class CauHoiService : Service<Model.Entities.CauHoi>, ICauHoiService
    {
        private readonly IBaiGiangRepository _baiGiangRepository;

        public CauHoiService(ICauHoiRepository repository, IBaiGiangRepository baiGiangRepository) : base(repository)
        {
            _baiGiangRepository = baiGiangRepository;
        }

   
    }
}
