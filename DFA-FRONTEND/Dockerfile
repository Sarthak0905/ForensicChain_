FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Serve with a lightweight node server or just use Vite preview for demo purposes
# Since Vite preview works well for quick setups without Nginx, we'll use it
# Alternatively we could use Nginx, but Vite preview is simpler for this structure
EXPOSE 3000

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
