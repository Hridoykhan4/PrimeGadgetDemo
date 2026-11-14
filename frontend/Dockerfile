FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev || npm install --include=dev
COPY . .
ARG VITE_API_URL=https://api.primegadgets.ae
ARG VITE_WHATSAPP_NUMBER=971581234567
ENV VITE_API_URL=$VITE_API_URL VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER
RUN NODE_ENV=production npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
