using Eduverse.Service.Common;
using Eduverse.Service.DanhMucService.Dto;
using Eduverse.Service.DanhMucService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhMucService
{
    public interface IDanhMucService : IService<Model.Entities.DanhMuc>
    {
        Task<PagedList<DanhMucDto>> GetList(DanhMucSearch search);
        Task<DanhMucDto?> GetById(Guid id);
        Task<DanhMucDto> Create(CreateDanhMucRequest request);
        Task<DanhMucDto> Update(UpdateDanhMucRequest request);
        Task<bool> Delete(Guid id);
    }
}
