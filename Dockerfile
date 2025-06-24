FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY .env ./

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
