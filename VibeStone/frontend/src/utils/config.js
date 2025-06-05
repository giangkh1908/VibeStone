// Utility để detect environment và lấy URLs phù hợp
export const getApiUrl = () => {
  // Ưu tiên lấy từ environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback: tự động detect dựa trên domain hiện tại
  const currentDomain = window.location.origin;
  
  if (currentDomain.includes('localhost') || currentDomain.includes('127.0.0.1')) {
    return 'http://localhost:5000';
  } else {
    return 'https://vibe-stone-backend.vercel.app';
  }
};

export const getFrontendUrl = () => {
  if (import.meta.env.VITE_FRONTEND_URL) {
    return import.meta.env.VITE_FRONTEND_URL;
  }
  
  return window.location.origin;
};

export const isProduction = () => {
  return import.meta.env.PROD;
};

export const isDevelopment = () => {
  return import.meta.env.DEV;
};