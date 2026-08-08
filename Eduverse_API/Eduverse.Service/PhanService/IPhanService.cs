using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.PhanService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.PhanService
{
    public interface IPhanService : IService<Phan>
    {
        Task<PhanHocDto> CreatePhanHoc(CreatePhanRequest request);

        Task<PhanHocDto> UpdatePhanHoc(UpdatePhanRequest request);

        Task<bool> DeletePhanHoc(Guid id);

        Task UpdateStructure(UpdateCourseStructureRequest request);
    }
}
