using Eduverse.Service.Common;
using Eduverse.Service.TaiLieuService.Dto;
using Eduverse.Service.TaiLieuService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.TaiLieuService
{
    public interface ITaiLieuService : IService<Model.Entities.TaiLieu>
    {
        Task<List<TaiLieuDto>> GetListForManager(Guid IdBaiGiang);

        Task<TaiLieuDto> CreateTaiLieu(CreateTaiLieuRequest request);

        Task<bool> DeleteTaiLieu(Guid id);
    }
}
