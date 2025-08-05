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
  member?: User; // 중첩된 member 객체를 위한 속성
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
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

  const login = (userData: User) => {
    console.log('로그인 함수 호출됨:', userData);
    
    // 데이터 구조에 따라 사용자 정보 추출
    let actualUserData;
    if (userData.member) {
      // member 객체 안에 사용자 정보가 있는 경우
      actualUserData = {
        ...userData.member,
        profileImgUrl: userData.profileImgUrl || ""
      };
      console.log('member 객체에서 사용자 정보 추출:', actualUserData);
    } else {
      // 평면화된 구조인 경우
      actualUserData = {
        ...userData,
        profileImgUrl: userData.profileImgUrl || ""
      };
    }
    
    // 즉시 상태 업데이트
    setUser(actualUserData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(actualUserData));
    
    // 강제로 리렌더링을 위한 추가 업데이트
    setTimeout(() => {
      setUser(prev => {
        if (prev?.id !== actualUserData.id) {
          console.log('강제 상태 업데이트:', actualUserData);
          return actualUserData;
        }
        return prev;
      });
    }, 50);
    
    console.log('로그인 상태 업데이트 완료:', actualUserData);
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
      console.log('인증 확인 시작...');
      const response = await fetch('/api/members/info', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          console.log('인증 확인 성공:', data.data);
          
          // 데이터 구조에 따라 사용자 정보 추출
          let actualUserData;
          if (data.data.member) {
            // member 객체 안에 사용자 정보가 있는 경우
            actualUserData = {
              ...data.data.member,
              profileImgUrl: data.data.profileImgUrl || ""
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
          localStorage.setItem('user', JSON.stringify(actualUserData));
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
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    console.log('사용자 정보 새로고침 시작...');
    await checkAuth();
    console.log('사용자 정보 새로고침 완료');
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthContext 초기화 시작...');
      
      // 초기 로드 시 localStorage에서 사용자 정보 복원
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('localStorage에서 사용자 정보 복원:', userData);
          
          // 데이터 구조에 따라 사용자 정보 추출
          let actualUserData;
          if (userData.member) {
            // member 객체 안에 사용자 정보가 있는 경우
            actualUserData = {
              ...userData.member,
              profileImgUrl: userData.profileImgUrl || ""
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
        } catch (error) {
          console.error('localStorage 사용자 정보 파싱 실패:', error);
          localStorage.removeItem('user');
        }
      }
      
      // 서버에서 최신 사용자 정보 확인
      await checkAuth();
      console.log('AuthContext 초기화 완료');
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
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