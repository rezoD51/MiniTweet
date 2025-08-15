import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Token'ı her isteğe otomatik eklemek için interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('minitweet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt interceptor'u (opsiyonel, 401 gibi durumları global olarak ele almak için)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Örneğin, token süresi dolmuşsa kullanıcıyı logout yapıp login sayfasına yönlendir
      // Bu işlem AuthContext içinde yapılabilir veya burada bir event emit edilebilir.
      // Şimdilik sadece hatayı döndürelim.
      console.warn("API responded with 401 Unauthorized. Token might be expired or invalid.");
      // AuthContext'e haber verebiliriz:
      // window.dispatchEvent(new Event('auth-error-401')); // Ve AuthContext bunu dinleyebilir
    }
    return Promise.reject(error);
  }
);

export default apiClient;