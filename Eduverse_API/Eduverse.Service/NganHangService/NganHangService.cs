using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Service.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.NganHangRepository;



namespace Eduverse.Service.NganHangService
{
    public class NganHangService : Service<NganHang>, INganHangService
    {
        public NganHangService(INganHangRepository nganHangRepository) : base(nganHangRepository)
        {
        }
    }
}
