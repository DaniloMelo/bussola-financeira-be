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

FROM node:22-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

COPY --from=builder /usr/src/app/node_modules/.prisma /usr/src/app/node_modules/.prisma
COPY prisma/ ./prisma/

COPY .env .env

EXPOSE 3001

CMD [ "npm", "run", "start:prod" ]
