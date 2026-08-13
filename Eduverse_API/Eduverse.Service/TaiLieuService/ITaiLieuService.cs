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

        Task<TaiLieuDto> CreateTaiLieu(CreateTaiLieuRequest request);
        Task<TaiLieuDto> UpdateTaiLieu(UpdateTaiLieuRequest request);

        Task<bool> DeleteTaiLieu(Guid id);

        Task<string?> LayNoiDungTaiLieuTheoBaiGiangAsync(Guid idBaiGiang);
    }
}
