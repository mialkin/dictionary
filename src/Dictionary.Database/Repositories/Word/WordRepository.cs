﻿using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dictionary.Database.Models;
using Dictionary.Shared.ExtensionMethods;
using Dictionary.Shared.Filters;
using Microsoft.EntityFrameworkCore;

namespace Dictionary.Database.Repositories.Word
{
    public class WordRepository : BaseRepository<WordDto>, IWordRepository
    {
        private DictionaryDb Db { get; }

        public WordRepository(DictionaryDb db) : base(db)
        {
            Db = db;
        }

        public async Task CreateAsync(IEnumerable<WordDto> words)
        {
            // Грузить порциями по 1000 слов. Report back progress.
            await Db.Words.AddRangeAsync(words);
        }

        public async Task UpdateAsync(WordDto word)
        {
            var entity = await Db.Words.FindAsync(word.WordId);

            if (entity != null)
            {
                entity.GenderId = word.GenderId;
                entity.Transcription = word.Transcription;
                entity.Translation = word.Translation;

                Db.Words.Update(entity);
            }
        }

        public async Task<WordDto> GetByNameAsync(string name, int languageId)
        {
            var word = await Db.Words
                .Where(x => x.LanguageId == languageId && string.Equals(x.Name, name))
                .FirstOrDefaultAsync();

            return word;
        }

        public async Task<IList<WordDto>> ListAsync(WordListFilter filter)
        {
            var query = Db.Words.AsQueryable();

            if (filter.L != null)
            {
                query = query.Where(x => x.LanguageId == filter.L);
            }

            if (!string.IsNullOrWhiteSpace(filter.OrderByPropertyName))
            {
                query = filter.OrderByDescending ?
                    query.OrderByPropertyNameDescending(filter.OrderByPropertyName) :
                    query.OrderByPropertyName(filter.OrderByPropertyName);
            }

            var result = await query.Take(filter.Take).ToListAsync();

            return result;
        }

        public async Task<IList<WordDto>> SearchAsync(WordSearchFilter filter)
        {
            var query = Db.Words.AsQueryable();

            if (filter.L != null)
            {
                query = query.Where(x => x.LanguageId == filter.L);
            }

            if (!string.IsNullOrWhiteSpace(filter.Q))
            {
                query = query.Where(x => x.Name.StartsWith(filter.Q));
            }

            query = query
                .OrderBy(x => x.Name.Length)
                .ThenBy(x => x.Name);

            var result = await query.Take(filter.Take).ToListAsync();

            return result;
        }

        public async Task SaveChangesAsync()
        {
            await Db.SaveChangesAsync();
        }
    }
}
