FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY prisma/ ./prisma/

COPY .env ./

RUN npx prisma generate --schema=./prisma/schema.prisma

COPY . .

EXPOSE 3001

CMD [ "npm", "run", "dev:docker" ]
