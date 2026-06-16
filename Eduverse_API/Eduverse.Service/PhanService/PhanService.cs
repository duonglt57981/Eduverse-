using AutoMapper;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TienDoHocTapRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.PhanService.Request;
using Eduverse.Service.TaiLieuService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;


namespace Eduverse.Service.PhanService
{
    public class PhanService : Service<Phan>, IPhanService
    {
        private readonly Service.Core.Mapper.IMapper _mapper;
        private readonly IBaiGiangService _baiGiangService;
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IKhoaHocService _khoaHocService;
        private readonly ITaiLieuService _taiLieuService;
        private readonly IDangKyKhoaHocRepository _dangKyKhoaHocRepository;
        private readonly ITienDoHocTapRepository _tienDoHocTapRepository;

        
        public PhanService(
            IPhanRepository phanRepository,
            IBaiGiangService baiGiangService,
            ITaiLieuService taiLieuService,
            IKhoaHocRepository khoaHocRepository,
            Service.Core.Mapper.IMapper mapper,
            IDangKyKhoaHocRepository dangKyKhoaHocRepository,
            ITienDoHocTapRepository tienDoHocTapRepository,
            IKhoaHocService khoaHocService) : base(phanRepository)
        {
            _mapper = mapper;
            _baiGiangService = baiGiangService;
            _taiLieuService = taiLieuService;
            _khoaHocRepository = khoaHocRepository;
            _dangKyKhoaHocRepository = dangKyKhoaHocRepository;
            _tienDoHocTapRepository = tienDoHocTapRepository;
            _khoaHocService = khoaHocService;
        }

        public async Task<PhanHocDto> CreatePhanHoc(CreatePhanRequest request)  
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (string.IsNullOrWhiteSpace(request.TenPhan))
                throw new Exception("Vui lòng nhập tên phần học");

            var khoaHoc = await _khoaHocRepository
                .GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdKhoaHoc);

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            var maxThuTu = await GetQueryable()
                .Where(x => x.IdKhoaHoc == request.IdKhoaHoc)
                .MaxAsync(x => (int?)x.ThuTuSapXep) ?? 0;

            var entity = new Phan
            {
                IdKhoaHoc = request.IdKhoaHoc,
                TenPhan = request.TenPhan.Trim(),
                ThuTuSapXep = maxThuTu + 1,
                TrangThai = "ChoDuyet"
            };

            if (khoaHoc.TrangThaiPheDuyet == "DaDuyet")
                khoaHoc.TrangThaiPheDuyet = "ChoDuyetS";

            await CreateAsync(entity);
            await _khoaHocService.UpdateAsync(khoaHoc);
            await SaveAsync();

            return _mapper.Map<Phan,PhanHocDto>(entity);
        }


        public async Task<PhanHocDto> UpdatePhanHoc(UpdatePhanRequest request)
        {
            ArgumentNullException.ThrowIfNull(request);

            if (string.IsNullOrWhiteSpace(request.TenPhan))
                throw new Exception("Vui lòng nhập tên phần học");

            var khoaHocExistsTask = _khoaHocRepository
                .GetQueryable()
                .AnyAsync(x => x.Id == request.IdKhoaHoc);

            var entityTask = GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted);

            await Task.WhenAll(khoaHocExistsTask, entityTask);

            if (!khoaHocExistsTask.Result)
                throw new Exception("Không tìm thấy khóa học");

            var entity = entityTask.Result;
            if (entity == null)
                throw new Exception("Không tìm thấy phần học");

            var thuTuDaTon = await GetQueryable()
                .AnyAsync(x =>
                    x.IdKhoaHoc == request.IdKhoaHoc &&
                    x.ThuTuSapXep == request.ThuTuSapXep &&
                    x.Id != request.Id &&!x.IsDeleted);

            if (thuTuDaTon)
                throw new Exception($"Thứ tự {request.ThuTuSapXep} đã tồn tại trong phần học này");


            entity.IdKhoaHoc = request.IdKhoaHoc;
            entity.TenPhan = request.TenPhan.Trim();
            entity.ThuTuSapXep = request.ThuTuSapXep;
            entity.TrangThai = "ChoDuyetS";

            await UpdateAsync(entity);
            await SaveAsync();

            return _mapper.Map<Phan, PhanHocDto>(entity);
        }


        public async Task<bool> DeletePhanHoc(Guid id)
        {
            var phan = await GetAll().FirstOrDefaultAsync(x => x.Id == id);
            if (phan == null)
                throw new Exception("Không tim thấy phần học");

            var coNguoiHoc = await _dangKyKhoaHocRepository.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == phan.IdKhoaHoc);

            phan.TrangThai = coNguoiHoc == null ? "DaXoa" : "HoatDong";

            await DeleteAsync(phan);
            await SaveAsync();
            return true;
        }
    }
}
