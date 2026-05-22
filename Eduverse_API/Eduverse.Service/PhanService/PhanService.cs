using Eduverse.IRepository.KhoaHocRepository;
using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.Phan;
using Eduverse.Service.Common;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.PhanService.Request;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.PhanService
{
    public class PhanService : Service<Phan>, IPhanService
    {

        public PhanService(IPhanRepository phanRepository ) : base(phanRepository)
        {
        }
    }
}
