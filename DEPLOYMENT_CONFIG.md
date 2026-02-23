# Guía de Configuración de URLs para Producción

## Overview
Esta aplicación está configurada para ejecutarse en:
- **Frontend**: `https://byloa.agency`
- **Backend API**: `https://api.byloa.agency`

## Configuración en Desarrollo

### Frontend (.env)
```
VITE_FIREBASE_API_KEY=AIzaSyApq2oJBjxllPKsZovUWZgAzkMg5qHE1M8
VITE_FIREBASE_AUTH_DOMAIN=progen-ce347.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=progen-ce347
VITE_FIREBASE_STORAGE_BUCKET=progen-ce347.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=551999800898
VITE_FIREBASE_APP_ID=1:551999800898:web:df42f9b1069a6367be8fdb

# API Configuration (en desarrollo apunta a localhost)
VITE_API_URL=http://localhost:3000
```

### Backend (.env)
```
PORT=3000
HOST=0.0.0.0
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=byloa_db

# Allow requests from localhost during development
CORS_ORIGIN=http://localhost:5173

FIREBASE_PROJECT_ID=progen-ce347
FIREBASE_STORAGE_BUCKET=progen-ce347.firebasestorage.app
FIREBASE_KEY_PATH=./firebase-key.json

ADMIN_EMAIL=admin@byloa.com, admin@seiminteractive.io
```

## Configuración en Producción

### Frontend (.env.production)
```
VITE_FIREBASE_API_KEY=AIzaSyApq2oJBjxllPKsZovUWZgAzkMg5qHE1M8
VITE_FIREBASE_AUTH_DOMAIN=progen-ce347.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=progen-ce347
VITE_FIREBASE_STORAGE_BUCKET=progen-ce347.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=551999800898
VITE_FIREBASE_APP_ID=1:551999800898:web:df42f9b1069a6367be8fdb

# API Configuration (en producción apunta al subdominio api)
VITE_API_URL=https://api.byloa.agency
```

### Backend (.env.production)
```
PORT=3000
HOST=0.0.0.0
DB_HOST=your_production_db_host
DB_PORT=3306
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=byloa_db

# Allow requests from the main domain
CORS_ORIGIN=https://byloa.agency

FIREBASE_PROJECT_ID=progen-ce347
FIREBASE_STORAGE_BUCKET=progen-ce347.firebasestorage.app
FIREBASE_KEY_PATH=./firebase-key.json

ADMIN_EMAIL=admin@byloa.com, admin@seiminteractive.io
```

## Estructura de URLs

### API Endpoints
Todos los endpoints están centralizados en `/src/lib/config.js`:

```javascript
const API_BASE_URL = isDevelopment
  ? 'http://localhost:3000'
  : 'https://api.byloa.agency'

const API_ENDPOINTS = {
  ADMIN_EMAIL: '/api/config/admin-email',
  PROJECTS: '/api/projects',
  PROJECT: (id) => `/api/projects/${id}`,
  TRUSTED_BRANDS: '/api/trusted-brands',
  TRUSTED_BRAND: (id) => `/api/trusted-brands/${id}`,
  UPLOAD: '/api/upload',
  BRAND_UPLOAD: '/api/trusted-brands/upload'
}
```

### Uso en Componentes
Para hacer requests, usa el helper `apiURL()`:

```javascript
import { apiURL, API_ENDPOINTS } from '@/lib/config'

// Automáticamente detecta si estás en desarrollo o producción
const response = await fetch(apiURL(API_ENDPOINTS.PROJECTS))
```

## Deployment Checklist

### Backend
- [ ] Configurar DNS para `api.byloa.agency` apuntando al servidor backend
- [ ] Configurar SSL/TLS con certificado válido para `api.byloa.agency`
- [ ] Actualizar `.env` con variables de producción
- [ ] Verificar que CORS esté configurado con `https://byloa.agency`
- [ ] Ejecutar `npm start` para iniciar el servidor

### Frontend
- [ ] Actualizar `.env` con `VITE_API_URL=https://api.byloa.agency`
- [ ] Ejecutar `npm run build` para compilar
- [ ] Desplegar archivos de `dist/` a tu hosting
- [ ] Configurar SSL/TLS para `byloa.agency`

## Testing de Producción

### Verificar API disponible
```bash
curl https://api.byloa.agency/health
```

### Verificar CORS
```bash
curl -H "Origin: https://byloa.agency" https://api.byloa.agency/health
```

## Notas Importantes

1. **URLs dinámicas**: La aplicación detecta automáticamente si está en desarrollo o producción usando `import.meta.env.MODE`
2. **CORS**: Asegúrate de que CORS_ORIGIN en el backend coincida con la URL del frontend
3. **SSL/TLS**: Ambos dominios necesitan certificados SSL válidos
4. **Variables de entorno**: Cada environment (desarrollo/producción) tiene sus propias variables
