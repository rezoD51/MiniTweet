import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthStateContext = createContext(undefined);
const AuthDispatchContext = createContext(undefined);

const initialState = {
  token: localStorage.getItem('minitweet_token') || null,
  user: JSON.parse(localStorage.getItem('minitweet_user')) || null, // User'ı da localStorage'dan yükle
  isAuthenticated: !!localStorage.getItem('minitweet_token'), // Token varsa başlangıçta true yapabiliriz
  loading: !localStorage.getItem('minitweet_token'), // Token yoksa ve user yüklenmemişse loading true
  error: null,
};
// Eğer başlangıçta token varsa ve user da localStorage'dan yüklendiyse, loading: false olabilir.
// Şimdilik, token varsa ama user yüklenmemişse /auth/me ile doğrulamak için loading: true bırakalım.
// Veya en basiti:
// loading: true, // Her zaman başlangıçta true, useEffect ile false yapılır.

function authReducer(state, action) {
  console.log("AuthReducer - Action:", action.type, "Payload:", action.payload);
  console.log("AuthReducer - Önceki state.isAuthenticated:", state.isAuthenticated, "Önceki state.loading:", state.loading);

  switch (action.type) {
    case 'REQUEST_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS': // Register sonrası da login gibi state güncellenir
      localStorage.setItem('minitweet_token', action.payload.token);
      localStorage.setItem('minitweet_user', JSON.stringify(action.payload.user));
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`; // Axios header'ını güncelle
      const loginState = {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
      console.log("AuthReducer - LOGIN/REGISTER_SUCCESS sonrası state.isAuthenticated:", loginState.isAuthenticated, "state.loading:", loginState.loading);
      return loginState;

    case 'LOAD_USER_SUCCESS':
      // localStorage'a user'ı kaydetmek isteğe bağlı, zaten login/register'da kaydediliyor.
      // Eğer /auth/me sadece user dönerse ve token zaten varsa, token'ı state'de koru.
      const loadUserState = {
        ...state, // Önceki token'ı koru
        user: action.payload,
        isAuthenticated: true, // User başarıyla yüklendiyse authenticated true olmalı
        loading: false,
        error: null,
      };
      console.log("AuthReducer - LOAD_USER_SUCCESS sonrası state.isAuthenticated:", loadUserState.isAuthenticated, "state.loading:", loadUserState.loading);
      return loadUserState;

    case 'AUTH_ERROR': // Genel hata durumu, genellikle token geçersiz veya yükleme başarısız
    case 'LOGOUT':
      localStorage.removeItem('minitweet_token');
      localStorage.removeItem('minitweet_user');
      delete apiClient.defaults.headers.common['Authorization']; // Axios header'ını temizle
      const logoutState = {
        ...initialState, // Temiz duruma dön (initialState'de token ve user null olacak)
        token: null,      // Açıkça null yap
        user: null,       // Açıkça null yap
        isAuthenticated: false,
        loading: false,
        error: action.payload || (action.type === 'AUTH_ERROR' ? "Authentication error" : null),
      };
      console.log("AuthReducer - LOGOUT/AUTH_ERROR sonrası state.isAuthenticated:", logoutState.isAuthenticated, "state.loading:", logoutState.loading);
      return logoutState;
    
    case 'LOADING_COMPLETE': // Sadece loading'i false yapmak için
        return {...state, loading: false };

    case 'UPDATE_USER_CONTEXT':
        localStorage.setItem('minitweet_user', JSON.stringify({ ...state.user, ...action.payload }));
        return {
            ...state,
            user: { ...state.user, ...action.payload }
        };
    case 'CLEAR_ERROR':
        return { ...state, error: null };
    default:
      console.warn("AuthReducer - Bilinmeyen action type:", action.type);
      return state; // Bilinmeyen action type için mevcut state'i döndür
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Bu useEffect, uygulama ilk yüklendiğinde veya sayfa yenilendiğinde çalışır.
  // Amacı, localStorage'daki token ile kullanıcıyı doğrulamak/yüklemektir.
  useEffect(() => {
    const tokenInStorage = localStorage.getItem('minitweet_token');
    console.log("AuthProvider useEffect - Token in storage:", tokenInStorage, "Current state.user:", state.user);

    if (tokenInStorage) {
      // apiClient header'ını ayarla (sayfa yenilemelerinde önemli)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenInStorage}`;
      
      // Eğer context'teki user bilgisi henüz yüklenmemişse /auth/me isteği at.
      // Login/Register zaten user'ı yüklüyor, bu daha çok sayfa yenilemesi için.
      if (!state.user) { // Sadece user bilgisi yoksa yükle
        const loadUserOnMount = async () => {
          console.log("AuthProvider useEffect - Attempting to load user via /auth/me");
          dispatch({ type: 'REQUEST_START' });
          try {
            const response = await apiClient.get('/auth/me'); // Bu endpoint user bilgilerini dönmeli
            dispatch({ type: 'LOAD_USER_SUCCESS', payload: response.data });
          } catch (err) {
            console.error("AuthProvider useEffect - Failed to load user on mount:", err.response?.data?.message || err.message);
            dispatch({ type: 'LOGOUT' }); // Token geçersizse veya /me hata verirse logout yap
          }
        };
        loadUserOnMount();
      } else if (state.loading) {
        // User var ama loading hala true ise (initialState'den dolayı olabilir), loading'i false yap.
        // Bu durum, initialState'in loading:true ile başlaması ve token/user'ın zaten localStorage'dan
        // initialState'e yüklenmiş olması durumunda oluşabilir.
        console.log("AuthProvider useEffect - User exists, setting loading to false.");
        dispatch({ type: 'LOADING_COMPLETE' });
      }
    } else {
      // Token yoksa, kullanıcı doğrulanmamış ve yükleme tamamlanmış kabul et.
      console.log("AuthProvider useEffect - No token in storage, ensuring logout state.");
      // Bu dispatch, initialState'de loading:true ise ve token yoksa loading'i false yapar.
      // Eğer zaten loading:false ise bir şey değiştirmez (eğer initialState.loading:false ise)
      // dispatch({ type: 'LOGOUT' }); // Bu, error mesajı da set edebilir, belki sadece LOADING_COMPLETE daha iyi
      if(state.loading){ // Sadece hala loading ise loading'i false yap
        dispatch({ type: 'LOADING_COMPLETE' });
      }
    }
  }, [dispatch, state.user]); // state.user değiştiğinde (login/register sonrası) tekrar tetiklenmemesi için dikkatli olmalı.
                             // Sadece mount'ta çalışması için dispatch yeterli olabilir.
                             // Ancak, token silindiğinde (logout) tekrar çalışıp loading'i false yapmalı.
                             // Bu useEffect'in bağımlılıklarını proje akışına göre ayarlamak önemli.
                             // Şimdilik [dispatch] ile bırakıyorum, bu sadece mount'ta çalıştırır.
                             // Eğer logout sonrası doğru state'e dönmüyorsa, [state.token, dispatch] denenebilir.
                             // Ama login sonrası user'ı aldığı için [state.user, dispatch] mantıklı.
                             // En iyisi, bu useEffect'i sadece mount'ta çalıştırmak ve 
                             // login/register/logout fonksiyonlarının state'i tam olarak yönetmesini sağlamak.
                             // Bu yüzden bağımlılığı sadece [dispatch] yapıyorum.

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
}

export function useAuthDispatch() {
  const context = useContext(AuthDispatchContext);
  if (context === undefined) {
    throw new Error('useAuthDispatch must be used within an AuthProvider');
  }
  return context;
}

export function useAuthActions() {
    const dispatch = useAuthDispatch();

    const login = async (credentials) => {
      dispatch({ type: 'REQUEST_START' });
      try {
          const response = await apiClient.post('/auth/login', credentials);
          console.log("AuthActions - Login API yanıtı:", response.data);
          if (response.data && response.data.token && response.data.user) {
              dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
              // localStorage işlemleri artık reducer içinde veya burada da kalabilir.
              // Reducer'da olması state ile senkronizasyonu garantiler.
              console.log("AuthActions - Login başarılı, state güncellenecek.");
              return response.data;
          } else {
              throw new Error("Invalid login response from server: token or user missing");
          }
      } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed.';
          console.error("AuthActions - Login error:", errorMessage);
          dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
          throw error; // Hatayı LoginPage'in yakalaması için tekrar fırlat
      }
  };

    const register = async (userData) => {
        dispatch({ type: 'REQUEST_START' });
        try {
            const response = await apiClient.post('/auth/register', userData);
            console.log("AuthActions - Register API yanıtı:", response.data);
             if (response.data && response.data.token && response.data.user) {
                dispatch({ type: 'REGISTER_SUCCESS', payload: response.data });
                // localStorage işlemleri reducer içinde
                console.log("AuthActions - Register başarılı, state güncellenecek.");
                return response.data;
            } else {
                throw new Error("Invalid register response from server: token or user missing");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed.';
            console.error("AuthActions - Register error:", errorMessage);
            dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
            throw error;
        }
    };

    const logout = () => {
        console.log("AuthActions - Logout çağrıldı.");
        dispatch({ type: 'LOGOUT' });
    };
    
    const updateUserContext = (updatedUserData) => {
        dispatch({ type: 'UPDATE_USER_CONTEXT', payload: updatedUserData });
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    return { login, register, logout, updateUserContext, clearError };
}