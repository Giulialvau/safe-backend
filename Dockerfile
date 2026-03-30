FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# DEBUG: controlliamo che dist esista
RUN ls -la /app/dist

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
