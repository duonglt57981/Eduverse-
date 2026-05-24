using Eduverse.IRepository.Common;

namespace Eduverse.IRepository.KhoaHocRepository
{
    public class KhoaHocRepository
        : Repository<Model.Entities.KhoaHoc>, IKhoaHocRepository
    {
        public KhoaHocRepository(Model.EduverseContext context): base(context)
        {
        }
    }
}