"use client";

import Link from "next/link";
<<<<<<< HEAD
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
=======
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
>>>>>>> b0ee16a (work)

export default function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();

<<<<<<< HEAD
  // 디버깅용: 사용자 정보 출력
  useEffect(() => {
    if (user) {
      console.log("Navigation - User info:", user);
      console.log("Navigation - profileImgUrl:", user.profileImgUrl);
    }
  }, [user]);

=======
>>>>>>> b0ee16a (work)
  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="w-full max-w-6xl mx-auto flex justify-between items-center py-5 px-6">
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
              <Link href="/mypage" className="text-[#2b6cb0] hover:text-[#5ac7b2] transition">
<<<<<<< HEAD
<<<<<<< HEAD
                {user?.profileImgUrl ? (
=======
                {user?.profileImgUrl && user.profileImgUrl.trim() !== '' ? (
>>>>>>> 8e45b00 (feat: 프사)
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={user.profileImgUrl}
                      alt="프로필 이미지"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('프로필 이미지 로드 실패:', user.profileImgUrl);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <FaUserCircle size={32} className="hidden" />
                  </div>
                ) : (
                  <FaUserCircle size={32} />
                )}
=======
                <FaUserCircle size={32} />
>>>>>>> b0ee16a (work)
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
    </nav>
  );
} 