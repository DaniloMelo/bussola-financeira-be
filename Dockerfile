FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 3001

CMD [ "npm", "run", "dev:docker" ]
