using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Model.Entities;
using Eduverse.Repository.Common;

namespace Eduverse.Service.Common
{
    public class Service<T> : IService<T> where T : class, IAuditableEntity
    {
        private readonly IRepository<T> _repository;


        public Service(IRepository<T> repository)
        {
            _repository = repository;
        }


        public async Task<T?> GetByIdAsync(Guid? guid)
        {
            return await _repository.GetByIdAsync(guid);
        }

        public async Task<T> GetByIdOrThrowAsync(Guid? guid)
        {
            var entity = await _repository.GetByIdAsync(guid);
            if (entity == null)
            {
                string entityName = typeof(T).Name;
                var displayNameAttribute = typeof(T).GetCustomAttribute<DisplayNameAttribute>();
                if (displayNameAttribute != null)
                {
                    entityName = displayNameAttribute.DisplayName;
                }
                throw new Exception($"Không tìm thấy {entityName} với Id {guid}");
            }
            return entity;
        }


        public virtual async Task CreateAsync(T entity)
        {
            _repository.Add(entity);
            await _repository.SaveAsync();
        }

        public virtual async Task CreateAsync(IEnumerable<T> entities)
        {
            foreach (var entity in entities)
            {
                _repository.Add(entity);
            }
            await _repository.SaveAsync();
        }

        public virtual async Task UpdateAsync(T entity)
        {
            _repository.Update(entity);
            await _repository.SaveAsync();
        }

        public virtual async Task UpdateAsync(IEnumerable<T> entities)
        {
            foreach (var entity in entities)
            {
                _repository.Update(entity);
            }
            await _repository.SaveAsync();
        }

        public async Task DeleteAsync(T entity)
        {
            _repository.Delete(entity);
            await _repository.SaveAsync();
        }

        public IQueryable<T> GetQueryable()
        {
            return _repository.GetQueryable();
        }
        public IQueryable<T> GetAll()
        {
            return _repository.GetAll();
        }
        public async Task DeleteAsync(IEnumerable<T> entities)
        {
            _repository.Delete(entities);
            await _repository.SaveAsync();
        }

        public async Task CreateRange(IEnumerable<T> entities)
        {
            _repository.AddRange(entities);
            await _repository.SaveAsync();
        }

        public IQueryable<T> Where(Expression<Func<T, bool>> predicate)
        {
            return _repository.GetQueryable().Where(predicate);
        }

        public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
        {
            return await _repository.GetQueryable().FirstOrDefaultAsync(predicate);
        }

        public int Count(Expression<Func<T, bool>> predicate)
        {
            return _repository.GetQueryable().Count(predicate);
        }

        public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
        {
            return await _repository.AnyAsync(predicate);
        }

        public async Task SaveAsync()
        {
            await _repository.SaveAsync();
        }
        public void Delete(Expression<Func<T, bool>> filter)
        {
            //_repository.Delete(filter);
        }


        public IEnumerable<T> FindBy(Expression<Func<T, bool>> predicate)
        {
            return _repository.FindBy(predicate);
        }

        public async Task DeleteRange(IEnumerable<T> entities)
        {
            if (entities != null && entities.Any())
            {
                _repository.Delete(entities);
                await _repository.SaveAsync();
            }
        }
    }
}
