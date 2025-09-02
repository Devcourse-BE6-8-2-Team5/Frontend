"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/utils/apiHelper';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImgUrl?: string;
  level?: number;
  exp?: number;
  member?: User; // 중첩된 member 객체를 위한 속성
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (userData: User, accessToken?: string) => void;
  logout: (showAlert?: boolean) => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('accessToken');
    }
    return null;
  });

  const login = (userData: User, token?: string) => {
    console.log('AuthContext login 호출됨:', userData);
    
    // accessToken이 제공된 경우 sessionStorage에 저장
    if (token) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', token);
      }
      setAccessToken(token);
      console.log('AccessToken이 sessionStorage에 저장되었습니다.');
    }
    
    // 데이터 구조에 따라 사용자 정보 추출
    let actualUserData;
    if (userData.member) {
      // member 객체 안에 사용자 정보가 있는 경우
      actualUserData = {
        ...userData.member,
        profileImgUrl: userData.member.profileImgUrl || ""
      };
      console.log('member 객체에서 사용자 정보 추출:', actualUserData);
    } else {
      // 평면화된 구조인 경우
      actualUserData = {
        ...userData,
        profileImgUrl: userData.profileImgUrl || ""
      };
    }
    
    setUser(actualUserData);
    setIsAuthenticated(true);
  };

  const logout = async (showAlert: boolean = true) => {
    try {
      // 로그아웃 API 호출
      const response = await apiRequest('/api/members/logout', {
        method: 'DELETE',
      }, accessToken);

      // API 호출 성공 여부와 관계없이 로컬 상태 정리
      setUser(null);
      setIsAuthenticated(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken');
      }
      setAccessToken(null);
      
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
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken');
      }
      setAccessToken(null);
      
      // showAlert가 true일 때만 알림 표시
      if (showAlert) {
        alert('로그아웃되었습니다.');
      }
      window.location.href = '/';
    }
  };

  const checkAuth = async () => {
    try {
      const response = await apiRequest('/api/members/info', {}, accessToken);

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          console.log('checkAuth에서 받은 데이터:', data.data);
          
          // 데이터 구조에 따라 사용자 정보 추출
          let actualUserData;
          if (data.data.member) {
            // member 객체 안에 사용자 정보가 있는 경우
            actualUserData = {
              ...data.data.member,
              profileImgUrl: data.data.member.profileImgUrl || ""
            };
            console.log('member 객체에서 사용자 정보 추출:', actualUserData);
          } else {
            // 평면화된 구조인 경우
            actualUserData = {
              ...data.data,
              profileImgUrl: data.data.profileImgUrl || ""
            };
          }
          
          setUser(actualUserData);
          setIsAuthenticated(true);
        }
      } else if (response.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
      } else {
        console.error('인증 확인 실패:', response.status);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('인증 확인 실패:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // 서버에서 사용자 정보 확인 (JWT 토큰 기반)
      await checkAuth();
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    login,
    logout,
    checkAuth,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 