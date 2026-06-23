using Eduverse.Api.Controller;
using Eduverse.IService.ChungChiService;
using Eduverse.Model.Entities;
using Eduverse.Service.ChungChiService.Request;
using Eduverse.Service.Core.Mapper;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Eduverse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChungChiController : EduverseController
    {
        private readonly IChungChiService _service;
        private readonly IMapper _mapper;
        private readonly ILogger<ChungChiController> _logger;

        public ChungChiController(
            IChungChiService chungChiService,
            IMapper mapper,
            ILogger<ChungChiController> logger)
        {
            _service = chungChiService;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] ChungChiSearch search)
        {
            var result = await _service.GetPaged(search);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetail(Guid id)
        {
            var result = await _service.GetDetail(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost("Create")]
        public async Task<DataResponse<ChungChi>> Create([FromBody] ChungChiRequest model)
        {
            try
            {
                // Map từ request → entity (dùng mapper tự viết)
                var entity = _mapper.Map<ChungChiRequest, ChungChi>(model);
                entity.Id = Guid.NewGuid();
                await _service.CreateAsync(entity);
                await _service.SaveAsync();
                return DataResponse<ChungChi>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating ChungChi");
                return new DataResponse<ChungChi>
                {
                    Data = null,
                    Status = false,
                    Message = "An error occurred while creating the ChungChi."
                };
            }
        }

        [HttpPut("{id}")]
        public async Task<DataResponse> Update(Guid id, [FromBody] ChungChiRequest model)
        {
            try
            {
                var existingEntity = await _service.GetByIdAsync(id);
                if (existingEntity == null)
                    return DataResponse.False("Chứng chỉ không tồn tại.");

                _mapper.Map(model, existingEntity);
                await _service.UpdateChungChi(id, existingEntity);
                await _service.SaveAsync();
                return DataResponse.Success("Cập nhật chứng chỉ thành công.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ChungChi");
                return DataResponse.False(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _service.GetByIdAsync(id);

                if (entity == null)
                {
                    return DataResponse.False("Chứng chỉ không tồn tại.");
                }

                await _service.DeleteAsync(entity);
                await _service.SaveAsync();

                return DataResponse.Success("Xóa chứng chỉ thành công.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting ChungChi");

                return DataResponse.False(ex.Message);
            }
        }
    }
}