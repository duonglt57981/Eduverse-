using Eduverse.Repository.Common;

namespace Eduverse.Repository.KhoaHocRepository
{
    public class KhoaHocRepository
        : Repository<Model.Entities.KhoaHoc>, IKhoaHocRepository
    {
        public KhoaHocRepository(Model.EduverseContext context)
            : base(context)
        {
        }
    }
}