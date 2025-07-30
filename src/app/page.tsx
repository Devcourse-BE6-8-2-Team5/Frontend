"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const searchParams = useSearchParams();
  const { checkAuth } = useAuth();
  
  useEffect(() => {
    const loginSuccess = searchParams.get('loginSuccess');
    const message = searchParams.get('message');
    
    if (loginSuccess === 'true' && message) {
      alert(message); // 카카오 로그인 성공 메시지 팝업
      // 소셜로그인 성공 후 최신 사용자 정보 가져오기
      checkAuth();
    }
  }, [searchParams, checkAuth]);

  return (
    <div className="font-sans min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] flex flex-col items-center relative">
      {/* 상단 네비게이션은 layout.tsx에서 공통 처리됨 */}
      {/* 상단 카드 영역 */}
      <div className="flex flex-col items-center w-full gap-10 mt-2 pt-20">
        <div className="flex flex-row gap-8 w-full max-w-4xl justify-center">
          {/* 오늘의 뉴스 카드 */}
          <Link href="/todaynews" className="flex-1 min-w-[260px] max-w-[400px] h-[180px] rounded-3xl bg-gradient-to-b from-[#bfe0f5] via-[#8fa4c3] via-70% to-[#e6f1fb] flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <span className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">오늘의 뉴스</span>
          </Link>
          {/* OX 퀴즈 카드 */}
          <Link href="/oxquiz" className="flex-1 min-w-[260px] max-w-[400px] h-[180px] rounded-3xl bg-gradient-to-b from-[#bfe0f5] via-[#8fa4c3] via-70% to-[#e6f1fb] flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <span className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">OX 퀴즈</span>
          </Link>
        </div>
        {/* 카테고리 버튼 */}
        <div className="flex flex-row gap-4 w-full max-w-2xl justify-center mt-14">
          {['정치', '문화', 'IT', '경제', '사회'].map((cat) => (
            <button
              key={cat}
              className="px-7 py-2 rounded-full bg-white/80 text-[#383838] border border-[#e0e7ef] text-base font-semibold shadow hover:bg-[#e0f7fa] hover:text-[#2b6cb0] transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
        {/* 검색창 */}
        <div className="flex items-center w-full max-w-xl mt-1">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
            </span>
            <input
              type="text"
              placeholder="뉴스, 키워드 검색"
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7f9cf5] text-base bg-white shadow"
            />
          </div>
        </div>
      </div>
      {/* (아래 기사 리스트 등은 추후 구현) */}
    </div>
  );
}
