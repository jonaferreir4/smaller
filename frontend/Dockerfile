# Etapa 1: Build da aplicação React
FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependências
COPY package.json package-lock.json ./
RUN npm install

# Copiar todo o código e construir o app
COPY . .
RUN npm run build

# Etapa 2: Servir com NGINX
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Remove arquivos padrão do NGINX
RUN rm -rf ./*

# Copia os arquivos buildados do React para o NGINX
COPY --from=build /app/dist .

# Copiar configuração customizada do NGINX (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta padrão do NGINX
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
# Configuração do Axios para a API