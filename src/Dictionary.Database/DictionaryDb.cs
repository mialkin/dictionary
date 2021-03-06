﻿using Dictionary.Database.Models;
using Microsoft.EntityFrameworkCore;

namespace Dictionary.Database
{
    public sealed class DictionaryDb : DbContext
    {
        public DbSet<WordDto> Words { get; set; }

        public DictionaryDb(DbContextOptions<DictionaryDb> options) : base(options)
        {
            Database.EnsureCreated();
        }
    }
}
