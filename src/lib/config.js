// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:3000'
    : 'https://api.byloa.agency')

export const API_ENDPOINTS = {
  // Config
  ADMIN_EMAIL: '/api/config/admin-email',
  
  // Projects
  PROJECTS: '/api/projects',
  PROJECT: (id) => `/api/projects/${id}`,
  
  // Trusted Brands
  TRUSTED_BRANDS: '/api/trusted-brands',
  TRUSTED_BRAND: (id) => `/api/trusted-brands/${id}`,
  
  // Upload
  UPLOAD: '/api/upload',
  BRAND_UPLOAD: '/api/trusted-brands/upload'
}

export const apiURL = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`
}
