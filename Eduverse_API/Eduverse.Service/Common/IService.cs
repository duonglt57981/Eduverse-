using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Model.Entities;

namespace Eduverse.IService.Common
{
    public interface IService<T> where T : class, IAuditableEntity
    {
        Task<T?> GetByIdAsync(Guid? id);
        Task<T> GetByIdOrThrowAsync(Guid? guid);
        Task CreateAsync(T entity);
        Task CreateAsync(IEnumerable<T> entities);
        Task UpdateAsync(T entity);
        Task UpdateAsync(IEnumerable<T> entities);
        Task DeleteAsync(T entity);
        IQueryable<T> GetQueryable();
        Task DeleteAsync(IEnumerable<T> entities);
        IEnumerable<T> FindBy(Expression<Func<T, bool>> predicate);
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
        IQueryable<T> Where(Expression<Func<T, bool>> predicate);
        void Delete(Expression<Func<T, bool>> filter);
        Task DeleteRange(IEnumerable<T> entities);
        Task CreateRange(IEnumerable<T> entities);
        Task SaveAsync();
    }
}
