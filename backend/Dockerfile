# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia e restaura dependências apenas do projeto da API
COPY smaller.csproj ./
RUN dotnet restore smaller.csproj

# Copia o restante dos arquivos e compila para produção
COPY . .
RUN dotnet publish smaller.csproj -c Release -o /app --no-restore

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .

# Expor porta padrão e rodar como usuário não-root (UID padrão do .NET 8)
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
USER $APP_UID

ENTRYPOINT ["dotnet", "smaller.dll"]
