# 1. Node.js ka lightweight image use karein
FROM node:22-alpine
# 2. Container ke andar app ka folder banayein
WORKDIR /app

# 3. Sirf package.json aur package-lock.json pehle copy karein
COPY package*.json ./

# 4. Dependencies install karein
RUN npm install

# 5. Baki sara project code (app.js, routes, controllers, etc.) copy karein
COPY . .

# 6. Port 7000 expose karein (kyunke aap ka app 7000 par chal raha hai)
EXPOSE 7000

# 7. App ko start karne ki command
CMD ["node", "app.js"]