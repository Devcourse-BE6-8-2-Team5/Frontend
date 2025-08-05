"use client";

import Link from "next/link";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { getCharacterImageByLevel } from "@/utils/characterUtils";

export default function Navigation() {
  const { isAuthenticated, user, logout, isLoading, refreshUser } = useAuth();
  const [characterImage, setCharacterImage] = useState<string>("🐣");
  const [forceUpdate, setForceUpdate] = useState(0);
  const [displayUser, setDisplayUser] = useState<any>(null);

  // 디버깅용: 사용자 정보 출력
  useEffect(() => {
    console.log("Navigation - 인증 상태:", isAuthenticated);
    console.log("Navigation - 사용자 정보:", user);
    if (user) {
      console.log("Navigation - 사용자 이름:", user.name);
      console.log("Navigation - 프로필 사진 Url:", user.profileImgUrl);
    }
  }, [user, isAuthenticated]);

  // 사용자 정보를 직접 확인하고 표시
  useEffect(() => {
    const checkUserFromStorage = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('Navigation - localStorage에서 사용자 정보 확인:', userData);
          
          // 데이터 구조에 따라 사용자 정보 추출
          let actualUserData;
          if (userData.member) {
            // member 객체 안에 사용자 정보가 있는 경우
            actualUserData = {
              ...userData.member,
              profileImgUrl: userData.profileImgUrl || ""
            };
            console.log('Navigation - member 객체에서 사용자 정보 추출:', actualUserData);
          } else {
            // 평면화된 구조인 경우
            actualUserData = {
              ...userData,
              profileImgUrl: userData.profileImgUrl || ""
            };
          }
          
          setDisplayUser(actualUserData);
        } catch (error) {
          console.error('localStorage 사용자 정보 파싱 실패:', error);
        }
      }
    };

    // AuthContext의 사용자 정보가 있으면 사용, 없으면 localStorage에서 확인
    if (user) {
      setDisplayUser(user);
    } else {
      checkUserFromStorage();
    }
  }, [user]);

  // 사용자 레벨에 따른 캐릭터 이미지 설정
  useEffect(() => {
    const currentUser = displayUser || user;
    if (currentUser && currentUser.level) {
      console.log('Navigation - 사용자 레벨 업데이트:', currentUser.level);
      const image = getCharacterImageByLevel(currentUser.level);
      setCharacterImage(image);
    } else if (currentUser) {
      // 레벨이 없는 경우 기본 캐릭터 설정
      setCharacterImage("🐣");
    }
  }, [displayUser, user]);

  // 강제 리렌더링을 위한 함수
  const forceRerender = useCallback(() => {
    console.log('Navigation 강제 리렌더링');
    setForceUpdate(prev => prev + 1);
  }, []);

  // 사용자 정보가 변경될 때마다 강제 리렌더링
  useEffect(() => {
    if (user || displayUser) {
      forceRerender();
    }
  }, [user, displayUser, forceRerender]);

  const handleLogout = async () => {
    await logout();
  };

  // 로딩 중일 때는 스켈레톤 UI 표시
  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center py-5 px-6">
          <Link href="/" className="text-2xl font-extrabold text-[#2b6cb0] tracking-tight hover:opacity-80 transition">
            뉴스OX
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  // 표시할 사용자 정보 결정
  const currentUser = displayUser || user;
  const shouldShowUser = isAuthenticated && currentUser;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center py-5 px-6">
        <Link href="/" className="text-2xl font-extrabold text-[#2b6cb0] tracking-tight hover:opacity-80 transition">
          뉴스OX
        </Link>
        <div className="flex items-center gap-3">
          {shouldShowUser ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[#2b6cb0] font-semibold">
                  {currentUser.name}님
                </span>
                
                {/* 캐릭터 이미지로 마이페이지 링크 */}
                <Link href="/mypage" className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7f9cf5] to-[#43e6b5] flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                  <span className="text-lg">{characterImage}</span>
                </Link>
              </div>
              <button 
                onClick={handleLogout}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white font-semibold shadow hover:opacity-90 transition"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link href="/login">
              <button className="px-5 py-2 rounded-full bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white font-semibold shadow hover:opacity-90 transition">
                로그인
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 