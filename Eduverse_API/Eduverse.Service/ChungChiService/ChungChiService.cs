using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.AppUserRepository;
using Eduverse.Repository.ChungChiRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Service.ChungChiService;
using Eduverse.Service.ChungChiService.Dto;
using Eduverse.Service.ChungChiService.Request;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Eduverse.IService.ChungChiService
{
    public class ChungChiService : Service<ChungChi>, IChungChiService
    {
        private readonly IChungChiRepository _chungChiRepository;
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IDangKyKhoaHocRepository _dangKyRepository;
        private readonly IAppUserRepository _appUserRepository;
        private readonly IMapper _mapper;

        public ChungChiService(
            IChungChiRepository chungChiRepository,
            IKhoaHocRepository khoaHocRepository,
            IDangKyKhoaHocRepository dangKyRepository,
            IAppUserRepository appUserRepository,
            IMapper mapper
        ) : base(chungChiRepository)
        {
            _chungChiRepository = chungChiRepository;
            _khoaHocRepository = khoaHocRepository;
            _dangKyRepository = dangKyRepository;
            _appUserRepository = appUserRepository;
            _mapper = mapper;
        }

        public async Task<PagedList<ChungChiResponse>> GetPaged(ChungChiSearch search)
        {
            var query = from cc in _chungChiRepository.GetQueryable().Where(x => !x.IsDeleted)
                        join kh in _khoaHocRepository.GetQueryable() on cc.IdKhoaHoc equals kh.Id into khJoin
                        from kh in khJoin.DefaultIfEmpty()
                        join dk in _dangKyRepository.GetQueryable() on cc.IdDangKi equals dk.Id into dkJoin
                        from dk in dkJoin.DefaultIfEmpty()
                        join u in _appUserRepository.GetQueryable() on dk.IdNguoiDangKi equals u.Id into uJoin
                        from u in uJoin.DefaultIfEmpty()
                        select new ChungChiResponse
                        {
                            Id = cc.Id,
                            MaSoChungChi = cc.MaSoChungChi,
                            TenChungChi = cc.TenChungChi,
                            URL_ChungChi = cc.URL_ChungChi,
                            NgayCap = cc.NgayCap,
                            NgayHetHan = cc.NgayHetHan,
                            TrangThai = cc.TrangThai,
                            TongThoiGianHoc = cc.TongThoiGianHoc,
                            DiemTongKet = cc.DiemTongKet,
                            NgayTao = cc.NgayTao,
                            IdDangKi = cc.IdDangKi,
                            IdKhoaHoc = cc.IdKhoaHoc,
                            TenKhoaHoc = kh.TieuDe,
                            TenNguoiDung = u.HoTen,
                            IdNguoiDung = dk.IdNguoiDangKi
                        };

            if (search != null)
            {
                if (search.IdKhoaHoc.HasValue)
                    query = query.Where(x => x.IdKhoaHoc == search.IdKhoaHoc.Value);
                if (!string.IsNullOrEmpty(search.TrangThai))
                    query = query.Where(x => x.TrangThai == search.TrangThai);
                if (!string.IsNullOrEmpty(search.TenChungChi))
                    query = query.Where(x => x.TenChungChi != null && x.TenChungChi.Contains(search.TenChungChi));
                if (search.IdNguoiDung.HasValue)
                    query = query.Where(x => x.IdNguoiDung == search.IdNguoiDung.Value);
            }

            query = query.OrderByDescending(x => x.NgayCap ?? x.NgayTao);
            return await PagedList<ChungChiResponse>.CreateAsync(query, search ?? new ChungChiSearch());
        }

        public async Task<ChungChiResponse> GetDetail(Guid id)
        {
            var query = from cc in _chungChiRepository.GetQueryable().Where(x => x.Id == id && !x.IsDeleted)
                        join kh in _khoaHocRepository.GetQueryable() on cc.IdKhoaHoc equals kh.Id into khJoin
                        from kh in khJoin.DefaultIfEmpty()
                        select new ChungChiResponse
                        {
                            Id = cc.Id,
                            MaSoChungChi = cc.MaSoChungChi,
                            TenChungChi = cc.TenChungChi,
                            URL_ChungChi = cc.URL_ChungChi,
                            NgayCap = cc.NgayCap,
                            NgayHetHan = cc.NgayHetHan,
                            TrangThai = cc.TrangThai,
                            TongThoiGianHoc = cc.TongThoiGianHoc,
                            DiemTongKet = cc.DiemTongKet,
                            NgayTao = cc.NgayTao,
                            IdDangKi = cc.IdDangKi,
                            IdKhoaHoc = cc.IdKhoaHoc,
                            TenKhoaHoc = kh.TieuDe
                        };
            return await query.FirstOrDefaultAsync();
        }


        public async Task<ChungChi> UpdateChungChi(Guid id, ChungChi entity)
        {
            var existing = await GetByIdAsync(id);

            if (existing == null || existing.IsDeleted)
                throw new Exception("Không tìm thấy chứng chỉ");

            existing.MaSoChungChi = entity.MaSoChungChi;
            existing.TenChungChi = entity.TenChungChi;
            existing.URL_ChungChi = entity.URL_ChungChi;
            existing.NgayCap = entity.NgayCap;
            existing.NgayHetHan = entity.NgayHetHan;
            existing.TrangThai = entity.TrangThai;
            existing.TongThoiGianHoc = entity.TongThoiGianHoc;
            existing.DiemTongKet = entity.DiemTongKet;
            existing.IdDangKi = entity.IdDangKi;
            existing.IdKhoaHoc = entity.IdKhoaHoc;

            await UpdateAsync(existing);
            await SaveAsync();

            return existing;
        }

        public async Task<ChungChi> CreateChungChi(ChungChi entity)
        {
            entity.Id = Guid.NewGuid();
            entity.CreatedDate = DateTime.UtcNow;

            await CreateAsync(entity);
            await SaveAsync();

            return entity;
        }

        public async Task<bool> DeleteChungChi(Guid id)
        {
            var entity = await GetByIdAsync(id);

            if (entity == null)
                throw new Exception("Không tìm thấy chứng chỉ");

            await DeleteAsync(entity);
            await SaveAsync();

            return true;
        }
    }
}