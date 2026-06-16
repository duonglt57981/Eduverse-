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
                TenTaiLieu = request.TenTaiLieu.Trim(),
                URL = uploadResult.UrlDoc.Trim(),
                LoaiTaiLieu = fileExtension.Trim(),
                TrangThai = "HoatDong",
                CreatedDate = DateTime.UtcNow

            };

            await CreateAsync(entity);
            await SaveAsync();
            return _mapper.Map<TaiLieu, TaiLieuDto>(entity);
        }


        public async Task<TaiLieuDto> UpdateTaiLieu(UpdateTaiLieuRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var baiGiang = await _baiGiangRepository.GetByIdAsync(request.IdBaiGiang);
            if (baiGiang == null)
                throw new Exception("Không tìm thấy bài giảng");

            var entityCu = await GetByIdAsync(request.Id);
            if (entityCu == null)
                throw new Exception("Không tìm thấy tài liệu");
            await DeleteAsync(entityCu);

            var uploadResult = await _cloudinaryService.UploadDocumentAsync(request.Document);

            var fileExtension = Path.GetExtension(request.Document.FileName).TrimStart('.').ToUpper();

            // Tạo bản ghi mới
            var entityMoi = new TaiLieu
            {
                Id = Guid.NewGuid(),
                IdBaiGiang = request.IdBaiGiang.Value,
                TenTaiLieu = request.TenTaiLieu.Trim(),
                URL = uploadResult.UrlDoc.Trim(),
                LoaiTaiLieu = fileExtension.Trim(),
                TrangThai = "HoatDong",
            };

            await CreateAsync(entityMoi);
            await SaveAsync();

            return _mapper.Map<TaiLieu, TaiLieuDto>(entityMoi);
        }


        public async Task<bool> DeleteTaiLieu(Guid id)
        {
            var taiLieu = await GetByIdAsync(id);
            if (taiLieu == null)
                throw new Exception("Không tìm thấy bài giảng");

            taiLieu.TrangThai = "NgungHoatDong";

            await DeleteAsync(taiLieu);
            await SaveAsync();
            return true;

        }
    }
}
