using Eduverse.Service.Common;
using Eduverse.Service.DanhMucService;
using Eduverse.Service.DanhMucService.Dto;
using Eduverse.Service.DanhMucService.Request;
using Eduverse.Service.Dto;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Eduverse.Api.Controller
{
    [ApiController]
    [Route("api/danhmuc")]
    public class DanhMucController : EduverseController
    {
        private readonly IDanhMucService _danhMucService;

        public DanhMucController(IDanhMucService danhMucService)
        {
            _danhMucService = danhMucService;
        }

        #region GetList (Phân trang + tìm kiếm)
        [HttpGet]
        [AllowAnonymous]
        public async Task<DataResponse<PagedList<DanhMucDto>>> GetList([FromQuery] DanhMucSearch search)
        {
            var result = await _danhMucService.GetList(search);
            return new DataResponse<PagedList<DanhMucDto>>
            {
                Status = true,
                Message = "Lấy danh sách danh mục thành công",
                Data = result
            };
        }
        #endregion

        #region GetById
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<DataResponse<DanhMucDto>> GetById(Guid id)
        {
            var result = await _danhMucService.GetById(id);
            if (result == null)
            {
                return new DataResponse<DanhMucDto>
                {
                    Status = false,
                    Message = "Không tìm thấy danh mục",
                    Data = null
                };
            }
            return new DataResponse<DanhMucDto>
            {
                Status = true,
                Message = "Lấy danh mục thành công",
                Data = result
            };
        }
        #endregion

        #region Create
        [HttpPost]
        // [Authorize(Roles = "Admin")] // có thể thêm nếu cần
        public async Task<DataResponse<DanhMucDto>> Create([FromBody] CreateDanhMucRequest request)
        {
            var result = await _danhMucService.Create(request);
            return new DataResponse<DanhMucDto>
            {
                Status = true,
                Message = "Thêm danh mục thành công",
                Data = result
            };
        }
        #endregion

        #region Update
        [HttpPut]
        // [Authorize(Roles = "Admin")]
        public async Task<DataResponse<DanhMucDto>> Update([FromBody] UpdateDanhMucRequest request)
        {
            var result = await _danhMucService.Update(request);
            return new DataResponse<DanhMucDto>
            {
                Status = true,
                Message = "Cập nhật danh mục thành công",
                Data = result
            };
        }
        #endregion

        #region Delete
        [HttpDelete("{id}")]
        // [Authorize(Roles = "Admin")]
        public async Task<DataResponse<bool>> Delete(Guid id)
        {
            var result = await _danhMucService.Delete(id);
            return new DataResponse<bool>
            {
                Status = result,
                Message = result ? "Xóa danh mục thành công" : "Xóa danh mục thất bại",
                Data = result
            };
        }
        #endregion
    }
}