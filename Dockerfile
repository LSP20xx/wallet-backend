FROM node:18.16.1-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
EXPOSE 3000

CMD ["node", "start"]
