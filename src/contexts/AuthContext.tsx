"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImgUrl?: string;
  level?: number;
  exp?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: (showAlert?: boolean) => Promise<void>;
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
    // profileImgUrl이 없으면 빈 문자열로 설정
    const userWithProfile = {
      ...userData,
      profileImgUrl: userData.profileImgUrl || ""
    };
    setUser(userWithProfile);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userWithProfile));
  };

  const logout = async (showAlert: boolean = true) => {
    try {
      // 로그아웃 API 호출
      const response = await fetch('/api/members/logout', {
        method: 'DELETE',
        credentials: 'include',
      });

      // API 호출 성공 여부와 관계없이 로컬 상태 정리
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      
      // showAlert가 true일 때만 알림 표시
      if (showAlert) {
        if (response.ok) {
          alert('로그아웃되었습니다.');
        } else {
          alert('로그아웃되었습니다.');
        }
      }
      
      // 메인페이지로 리다이렉트
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
      
      // 에러가 발생해도 로컬 상태는 정리
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      
      // showAlert가 true일 때만 알림 표시
      if (showAlert) {
        alert('로그아웃되었습니다.');
      }
      window.location.href = '/';
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
        console.log('사용자가 로그인되지 않았습니다.');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      } else {
        console.error('인증 확인 실패:', response.status);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('인증 확인 실패:', error);
      // 백엔드 서버가 실행되지 않은 경우에도 에러를 던지지 않음
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    checkAuth();
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