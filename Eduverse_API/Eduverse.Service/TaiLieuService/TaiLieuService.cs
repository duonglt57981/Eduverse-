using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.TaiLieuService.Dto;
using Eduverse.Service.TaiLieuService.Request;


namespace Eduverse.Service.TaiLieuService
{
    public class TaiLieuService : Service<Model.Entities.TaiLieu>, ITaiLieuService
    {
        private readonly IMapper _mapper;
        private IBaiGiangRepository _baiGiangRepository;
        private readonly ICloudinaryService _cloudinaryService;
        public TaiLieuService( 
            IBaiGiangRepository baiGiangRepository,
            ITaiLieuRepository taiLieuRepository,
            IMapper mapper,
            ICloudinaryService cloudinaryService) : base(taiLieuRepository)
        {
            _baiGiangRepository = baiGiangRepository;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<TaiLieuDto> CreateTaiLieu(CreateTaiLieuRequest request)
        {
            var baiGiang = await _baiGiangRepository.GetByIdAsync(request.IdBaiGiang);
            if (baiGiang == null) throw new Exception("Không tìm thấy bài giảng");

            if (string.IsNullOrWhiteSpace(request.TenTaiLieu))
                throw new Exception("Vui lòng nhập tên tài liệu");

            if (request.Document == null)
                throw new Exception("Vui lòng chọn file tài liệu");

            var uploadResult = await _cloudinaryService.UploadDocumentAsync(request.Document);

            var fileExtension = Path.GetExtension(request.Document.FileName).TrimStart('.').ToUpper();

            var entity = new TaiLieu
            {
                IdBaiGiang = request.IdBaiGiang,
                TenTaiLieu = request.TenTaiLieu,
                URL = uploadResult.UrlDoc,
                LoaiTaiLieu = fileExtension,
                TrangThai = "HDI",
                CreatedDate = DateTime.UtcNow

            };

            await CreateAsync(entity);
            await SaveAsync();
            return _mapper.Map<TaiLieu, TaiLieuDto>(entity);
        }


        //public async Task<TaiLieuDto> UpdateTaiLieu(UpdateTaiLieuRequest request)
        //{
        //    var baiGiang = await GetByIdAsync(request.IdBaiGiang);
        //    if (baiGiang == null) throw new Exception("Không tìm thấy bài giảng");

        //    var entity = await GetByIdAsync(request.Id);
        //    if (entity == null) throw new Exception("Không tìm thấy tài liệu");

        //    entity.IdBaiGiang = request.IdBaiGiang.Value;
        //    entity.TenTaiLieu = request.TenTaiLieu;
        //    entity.URL = request.URL;
        //    entity.LoaiTaiLieu = request.LoaiTaiLieu;
        //    entity.TrangThai = request.TrangThai;
        //    entity.UpdatedDate = DateTime.UtcNow;
            
                
        //    await CreateAsync(entity);
        //    await SaveAsync();
        //    return _mapper.Map<TaiLieu, TaiLieuDto>(entity);
        //}


        public async Task<bool> DeleteTaiLieu(Guid id)
        {
            var taiLieu = await GetByIdAsync(id);
            if (taiLieu == null)
                throw new Exception("Không tìm thấy bài giảng");

            taiLieu.TrangThai = "KDI";

            await DeleteAsync(taiLieu);
            await SaveAsync();
            return true;

        }
    }
}
