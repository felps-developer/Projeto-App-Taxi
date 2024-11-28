FROM node:20-buster

WORKDIR /usr/src/app

# Copiar arquivos essenciais primeiro para usar cache
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm install

# Instalar TypeScript globalmente
RUN npm install -g typescript

# Copiar o restante do código
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Expor a porta do backend
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["npm", "start", "seed"]
