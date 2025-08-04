"use client";

import Link from "next/link";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getCharacterImageByLevel } from "@/utils/characterUtils";

export default function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const [characterImage, setCharacterImage] = useState<string>("🐣");

  // 디버깅용: 사용자 정보 출력
  useEffect(() => {
    if (user) {
      console.log("Navigation - 사용자 정보:", user);
      console.log("Navigation - 프로필 사진 Url:", user.profileImgUrl);
    }
  }, [user]);

  // 사용자 레벨에 따른 캐릭터 이미지 설정
  useEffect(() => {
    if (user && user.level) {
      const image = getCharacterImageByLevel(user.level);
      setCharacterImage(image);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center py-5 px-6">
        <Link href="/" className="text-2xl font-extrabold text-[#2b6cb0] tracking-tight hover:opacity-80 transition">
          뉴스OX
        </Link>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[#2b6cb0] font-semibold">
                  {user?.name}님
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