"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface TodayNews {
  id: number;
  title: string;
  content: string;
  originCreatedDate: string;
  journalist: string;
  mediaName: string;
  imgUrl?: string;
}

export default function Home() {
  const searchParams = useSearchParams();
  const [todayNews, setTodayNews] = useState<TodayNews | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loginSuccess = searchParams.get('loginSuccess');
    const message = searchParams.get('message');
    
    if (loginSuccess === 'true' && message) {
      alert(message); // 카카오 로그인 성공 메시지 팝업
    }
  }, [searchParams]);

  // 오늘의 뉴스 불러오기
  useEffect(() => {
    const fetchTodayNews = async () => {
      try {
        const res = await fetch('/api/news/today');
        if (res.ok) {
          const data = await res.json();
          if (data.code === 200 && data.data) {
            setTodayNews(data.data);
          }
        }
      } catch (error) {
        console.error('오늘의 뉴스 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayNews();
  }, []);

  return (
    <div className="font-sans min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] flex flex-col items-center relative">
      {/* 상단 네비게이션은 layout.tsx에서 공통 처리됨 */}
      {/* 상단 카드 영역 */}
      <div className="flex flex-col items-center w-full gap-10 mt-2 pt-20">
        <div className="flex flex-row gap-8 w-full max-w-4xl justify-center">
          {/* 오늘의 뉴스 카드 */}
          <Link href="/todaynews" className="flex-1 min-w-[260px] max-w-[400px] h-[180px] rounded-3xl bg-gradient-to-b from-[#bfe0f5] via-[#8fa4c3] via-70% to-[#e6f1fb] flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer overflow-hidden relative">
            {loading ? (
              <span className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">오늘의 뉴스</span>
            ) : todayNews ? (
              <>
                {/* 배경 이미지 */}
                {todayNews.imgUrl && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={todayNews.imgUrl}
                      alt="오늘의 뉴스"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {/* 뉴스 정보 - 제목을 아래에 배치 */}
                <div className="relative z-10 flex flex-col items-center justify-end text-center px-4 pb-6 h-full">
                  <div className="text-lg sm:text-xl font-bold text-white drop-shadow-md mb-2 line-clamp-2">
                    {todayNews.title}
                  </div>
                  <div className="text-sm text-white/90 drop-shadow-sm">
                    {todayNews.mediaName} • {new Date(todayNews.originCreatedDate).toLocaleDateString()}
                  </div>
                </div>
              </>
            ) : (
              <span className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">오늘의 뉴스</span>
            )}
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
