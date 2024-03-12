# Base image
FROM node:18.16.1-alpine as builder

# Argumento para especificar qué aplicación construir
ARG APP_NAME

WORKDIR /usr/src/app

# Copiar los archivos de definición de dependencia
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación específica
RUN npm run build ${APP_NAME}

# Etapa de producción
FROM node:18.16.1-alpine as production

ARG APP_NAME
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /usr/src/app/dist/apps/${APP_NAME} ./dist
COPY prisma ./prisma/

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/main"]
