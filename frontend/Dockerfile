# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Copia manuale dei file markdown nella cartella di build
# (Nota: in produzione reale questi file dovrebbero essere in un CMS o serviti da un'API,
# ma qui li mettiamo direttamente nel bundle statico per semplicità di fruizione locale)
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
