export interface User {
  id: string;
  name: string;
  email: string;
  job_title?: string;
  bio?: string;
}

export const setToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const removeToken = () => {
  localStorage.removeItem('auth_token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const setUser = (user: User) => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem('auth_user');
};

export const logout = () => {
  removeToken();
  removeUser();
  window.location.href = '/login';
};
