"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface TodayNews {
  id: number;
  title: string;
  imgUrl?: string;
}

export default function Home() {
  const [todayNews, setTodayNews] = useState<TodayNews | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayNews = async () => {
      try {
        const res = await fetch("/api/news/today");
        if (!res.ok) return;
        const data = await res.json();
        if (data.code === 200 && data.data) {
          setTodayNews({
            id: data.data.id,
            title: data.data.title,
            imgUrl: data.data.imgUrl || "",
          });
        } else {
          setTodayNews(null);
        }
      } catch {
        setTodayNews(null);
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
          <Link href="/todaynews" className="flex-1 min-w-[260px] max-w-[400px] h-[180px] rounded-3xl bg-gradient-to-b from-[#bfe0f5] via-[#8fa4c3] via-70% to-[#e6f1fb] flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer overflow-hidden relative group">
            {loading ? (
              <span className="text-2xl text-white">로딩 중...</span>
            ) : todayNews && todayNews.imgUrl ? (
              <>
                <Image
                  src={todayNews.imgUrl}
                  alt="오늘의 뉴스 이미지"
                  fill
                  className="object-cover w-full h-full absolute top-0 left-0 z-0 transition-transform group-hover:scale-105"
                  style={{ filter: 'brightness(0.7)' }}
                  priority
                />
                {/* 하단 그라데이션 오버레이 */}
                <div className="absolute left-0 right-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <span className="z-20 absolute left-0 right-0 bottom-0 pb-4 text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md text-center px-2 line-clamp-2">
                  {todayNews.title}
                </span>
              </>
            ) : todayNews ? (
              <span className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md text-center px-2 line-clamp-2">
                {todayNews.title}
              </span>
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
