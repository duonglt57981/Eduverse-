using Eduverse.IRepository.KhoaHocRepository;
using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.KhoaHocService
{
    public class KhoaHocService : Service<KhoaHoc>, IKhoaHocService
    {
        private readonly IKhoaHocRepository _khoaHocRepository;
        public KhoaHocService(IKhoaHocRepository khoaHocRepository) : base(khoaHocRepository)
        {
            _khoaHocRepository = khoaHocRepository;
        }

        public Task<PagedList<KhoaHocDto>> GetData(KhoaHocSearch search)
        {
            var query = from q in GetQueryable()
                        select new KhoaHocDto
                        {
                            Id = q.Id,
                            TieuDe = q.TieuDe,
                            MoTa = q.MoTa,
                            Gia = q.Gia,
                            GiaGoc = q.GiaGoc,
                            LoaiKhoaHoc = q.LoaiKhoaHoc,
                            HinhAnhKhoaHoc = q.HinhAnhKhoaHoc,
                            URLViewPreviewKhoaHoc = q.URLViewPreviewKhoaHoc,
                            CapDo = q.CapDo,
                            TongThoiLuong = q.TongThoiLuong,
                            TongBaiGiang = q.TongBaiGiang,
                            NgayTao = q.NgayTao,
                            NgayCapNhat = q.NgayCapNhat,
                            SoLuongHocVien = q.SoLuongHocVien,
                            TrangThaiPheDuyet = q.TrangThaiPheDuyet,
                            TrangThai = q.TrangThai
                        };
            if (!string.IsNullOrEmpty(search.TieuDe))
            {
                query = query.Where(x => x.TieuDe.Contains(search.TieuDe));
            }
            var resulrt = PagedList<KhoaHocDto>.CreateAsync(query, search);
            return resulrt;

        }


        public async Task<KhoaHocDto> GetDetail(Guid id)
        {
            return await _khoaHocRepository.GetQueryable()
                .Where(x => x.Id  == id)
                .Select(q => new KhoaHocDto
                {
                    Id = q.Id,
                    TieuDe = q.TieuDe,
                    MoTa = q.MoTa,
                    Gia = q.Gia,
                    GiaGoc = q.GiaGoc,
                    LoaiKhoaHoc = q.LoaiKhoaHoc,
                    HinhAnhKhoaHoc = q.HinhAnhKhoaHoc,
                    URLViewPreviewKhoaHoc = q.URLViewPreviewKhoaHoc,
                    CapDo = q.CapDo,
                    TongThoiLuong = q.TongThoiLuong,
                    TongBaiGiang = q.TongBaiGiang,  
                    NgayTao = q.NgayTao,
                    NgayCapNhat = q.NgayCapNhat,
                    SoLuongHocVien = q.SoLuongHocVien,
                    TrangThaiPheDuyet = q.TrangThaiPheDuyet,
                    TrangThai = q.TrangThai
                }).FirstOrDefaultAsync();

        }


        public async Task UpdateData(Guid id, UpdateKhoaHocRequest request)
        {
            var khoaHoc = await GetByIdAsync(id);

            if(khoaHoc == null) throw new Exception("Không tìm thấy khóa học!");

            khoaHoc.TieuDe = request.TieuDe;
            khoaHoc.MoTa = request.MoTa;
            khoaHoc.Gia = request.Gia;
            khoaHoc.GiaGoc = request.GiaGoc;
            khoaHoc.LoaiKhoaHoc = request.LoaiKhoaHoc;
            khoaHoc.HinhAnhKhoaHoc = request.HinhAnhKhoaHoc;
            khoaHoc.CapDo = request.CapDo;
            khoaHoc.TongThoiLuong = request.TongThoiLuong;
            khoaHoc.TongBaiGiang = request.TongBaiGiang;
            khoaHoc.NgayCapNhat = request.NgayCapNhat;
            khoaHoc.TrangThaiPheDuyet = request.TrangThaiPheDuyet;
            khoaHoc.SoLuongHocVien = request.SoLuongHocVien;
            khoaHoc.TrangThai = request.TrangThai;

            await _khoaHocRepository.SaveAsync();
        }


        public async Task DeleteData(Guid id{
            await _khoaHocRepository.de
        }
    }
}
