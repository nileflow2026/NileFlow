// sessionService.js
export const saveSession = (token, refreshToken) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
  };
  
  export const getToken = () => localStorage.getItem('authToken');
  export const getRefreshToken = () => localStorage.getItem('refreshToken');
  
  export const clearSession = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  };