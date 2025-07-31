"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
<<<<<<< HEAD
  profileImgUrl?: string;
=======
>>>>>>> b0ee16a (work)
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (userData: User) => {
<<<<<<< HEAD
    // profileImgUrl이 없으면 빈 문자열로 설정
    const userWithProfile = {
      ...userData,
      profileImgUrl: userData.profileImgUrl || ""
    };
    setUser(userWithProfile);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userWithProfile));
=======
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
>>>>>>> b0ee16a (work)
  };

  const logout = async () => {
    try {
      // 로그아웃 API 호출
      const response = await fetch('/api/members/logout', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        alert('로그아웃되었습니다.');
        // 메인페이지로 리다이렉트
        window.location.href = '/';
      }
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/members/info', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setUser(data.data);
          setIsAuthenticated(true);
        }
      } else if (response.status === 401) {
        // 인증되지 않은 경우 (정상적인 상황)
        console.log('사용자가 로그인되지 않았습니다.');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      } else {
        // 기타 서버 오류
        console.error('서버 오류:', response.status, response.statusText);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('인증 확인 실패:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    // 페이지 로드 시 인증 확인을 지연시켜 서버 부하 감소
    const timer = setTimeout(() => {
      checkAuth();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 