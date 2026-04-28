# Etapa 1: Construcción del Frontend (Vite/React)
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copiar dependencias del frontend
COPY frontend/package*.json ./
RUN npm install

# Copiar el resto del código del frontend y construirlo
COPY frontend/ ./
RUN npm run build

# Etapa 2: Preparación del Backend y Entorno de Producción
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias del backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend

# Instalar solo dependencias de producción para optimizar la imagen
RUN npm install --omit=dev

# Copiar el código fuente del backend
COPY backend/ ./

# Volver al directorio raíz de la aplicación
WORKDIR /app

# Copiar los archivos estáticos generados por el frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Exponer el puerto que usará Express
EXPOSE 3000

# Asegurar que estamos en la carpeta del backend al ejecutar
WORKDIR /app/backend

# Comando por defecto para iniciar el servidor
CMD ["node", "server.js"]
