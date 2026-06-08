
﻿using Eduverse.Repository.Common;
using Eduverse.Model;
using Eduverse.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace Eduverse.Repository.KhoaHocRepository
{
    public class KhoaHocRepository
        : Repository<Model.Entities.KhoaHoc>, IKhoaHocRepository
    {
        public KhoaHocRepository(Model.EduverseContext context): base(context)
        {
           
        }
    }
}