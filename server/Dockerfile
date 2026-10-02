FROM node:20-alpine

WORKDIR /app

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código-fonte, dados e fotos
COPY . .

# Configurar variáveis padrão do container
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "index.js"]
