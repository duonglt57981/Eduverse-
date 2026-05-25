using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.TaiLieuService.Dto;
using Eduverse.Service.TaiLieuService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.TaiLieuService
{
    public class TaiLieuService : Service<Model.Entities.TaiLieu>, ITaiLieuService
    {
        private readonly IMapper _mapper;
        private ITaiLieuRepository _taiLieuRepository;
        private IBaiGiangRepository _baiGiangRepository;
        public TaiLieuService(
            IMapper mapper,
            ITaiLieuRepository taiLieuRepository,
            IBaiGiangRepository baiGiangRepository
            ) : base(taiLieuRepository)
        {
        }

        //public async Task<TaiLieuDto> CreateTaiLieu(CreateTaiLieuRequest request)
        //{
        //    var baiGiang = await _baiGiangRepository.GetByIdAsync(request.IdBaiGiang);
        //    if (baiGiang == null) throw new Exception("Không tìm thấy bài giảng");


        //    var entity = new TaiLieuDto
        //    {
        //        IdBaiGiang = entity.IdBaiGiang,

        //    }

        //}
    }
}
