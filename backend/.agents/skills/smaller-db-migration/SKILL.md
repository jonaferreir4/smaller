---
name: smaller-db-migration
description: Guia e automação para gerenciar migrações do Entity Framework Core (EF Core 9 / PostgreSQL) no repositório smaller, garantindo integridade de dados e execução segura em ambiente containerizado.
---

# Gestão de Migrações EF Core no `smaller`

Esta skill orienta o fluxo correto de alteração de schema, adição de tabelas, índices e execução de migrações no **Entity Framework Core 9** para PostgreSQL no projeto **smaller**.

---

## 1. Passo a Passo para Alteração de Schema

1. **Atualizar / Criar Entidade em `Models/`**
   - Garantir propriedades com tipos nulos/não-nulos explícitos.
2. **Configurar via Fluent API em `Data/ApplicationDbContext.cs`**
   - **NUNCA** alterar schema apenas por Data Annotations nas Models.
   - Definir tamanho de colunas (`HasMaxLength`), unicidade (`IsUnique`), índices e FKs em `OnModelCreating`.
3. **Gerar a Migração via CLI**
   ```bash
   dotnet ef migrations add <NomeDescritivoDaMigracao>
   ```
4. **Inspecionar o arquivo gerado em `Migrations/`**
   - Verificar se as operações `Up` e `Down` estão corretas e reversíveis.

---

## 2. Padrões Fluent API para PostgreSQL

```csharp
modelBuilder.Entity<ShortenedUrl>(builder =>
{
    builder.HasKey(x => x.Id);
    builder.Property(x => x.Code).HasMaxLength(7).IsRequired();
    builder.HasIndex(x => x.Code).IsUnique();
    
    builder.HasMany(x => x.AccessLogs)
           .WithOne(x => x.ShortenedUrl)
           .HasForeignKey(x => x.ShortenedUrlId)
           .OnDelete(DeleteBehavior.Cascade);
});
```

---

## 3. Aplicação Segura de Migrações

- **Ambiente de Desenvolvimento:**
  - O `Program.cs` executa migrações automáticas na inicialização da API via `context.Database.Migrate()`.
- **Ambiente Containerizado (Docker / PostgreSQL):**
  - Garantir que a variável de ambiente de banco (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) esteja configurada no `.env` antes da execução.
