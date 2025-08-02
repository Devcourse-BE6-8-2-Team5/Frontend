"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface TodayNews {
  id: number;
  title: string;
  content: string;
  description: string;
  link: string;
  imgUrl: string;
  originCreatedDate: string;
  mediaName: string;
  journalist: string;
  originalNewsUrl: string;
  newsCategory: string;
}

export default function TodayNews() {
  const [news, setNews] = useState<TodayNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodayNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/news/today');
        const data = await response.json();
        
        if (response.ok && data.code === 200 && data.data) {
          setNews(data.data);
        } else {
          setError(data.message || '오늘의 뉴스를 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('오늘의 뉴스 조회 실패:', err);
        setError('서버 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTodayNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-2xl font-bold text-[#2b6cb0] mb-4">오늘의 뉴스를 불러오는 중...</div>
        <div className="w-8 h-8 border-4 border-[#7f9cf5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] px-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</div>
          <div className="text-gray-600 mb-6">{error}</div>
          <Link href="/" className="px-6 py-3 bg-[#7f9cf5] text-white rounded-full hover:bg-[#5a7bd8] transition-colors">
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] px-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 mb-4">오늘의 뉴스가 없습니다</div>
          <div className="text-gray-500 mb-6">오늘 선정된 뉴스가 없습니다.</div>
          <Link href="/" className="px-6 py-3 bg-[#7f9cf5] text-white rounded-full hover:bg-[#5a7bd8] transition-colors">
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
              <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 신문 헤더 */}
        <div className="bg-white mb-6 shadow-2xl rounded-2xl">
          <div className="bg-blue-100 text-[#2b6cb0] p-4 text-center rounded-t-2xl">
            <h1 className="text-4xl font-black tracking-wider">오늘의 뉴스</h1>
            <p className="text-sm mt-2">뉴스를 읽고 오늘의 퀴즈에 도전하세요!</p>
          </div>
          
          {/* 신문 메타 정보 */}
          <div className="bg-gray-100 p-3 text-center rounded-b-2xl">
            <div className="text-sm text-gray-600">
              <span className="font-bold">{new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}</span>
            </div>
          </div>
        </div>

        {/* 메인 신문 기사 */}
        <div className="bg-white shadow-2xl rounded-2xl">
          {/* 헤드라인 */}
          <div className="p-6">
            <h1 className="text-4xl font-black text-center leading-tight mb-4">
              {news.title}
            </h1>

            <div className="text-center text-gray-600 border-t-2 border-gray-300 pt-4">
              <span>{news.mediaName}</span>
              <span className="mx-3">•</span>
              <span>{news.journalist}</span>
              <span className="mx-3">•</span>
              <span>{new Date(news.originCreatedDate).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
              <span className="mx-3">•</span>
              <a 
                href={news.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 underline"
              >
                원문보기
              </a>
            </div>
          </div>

                    {/* 기사 내용 */}
          <div className="p-6">
                        {/* 이미지 */}
            {news.imgUrl && (
              <div className="-mt-4 mb-16 text-center -mx-6">
                <Image 
                  src={news.imgUrl} 
                  alt="뉴스 이미지" 
                  width={600}
                  height={450}
                  className="w-full max-w-xl h-auto object-cover rounded-lg mx-auto"
                />
              </div>
            )}
            
            {/* 본문 */}
            <div className="text-gray-800 leading-relaxed space-y-4">
              {(() => {
                const content = news.content;
                
                // [서울=뉴시스] 패턴 찾기
                const locationMatch = content.match(/\[([^\]]+)\]/);
                const location = locationMatch ? locationMatch[0] : '';
                
                // (사진=... 제공) 패턴 찾기
                const photoMatch = content.match(/\(사진=[^)]+\)/);
                const photo = photoMatch ? photoMatch[0] : '';
                
                // 날짜 패턴 찾기 (YYYY.MM.DD 형식)
                const dateMatch = content.match(/\d{4}\.\d{2}\.\d{2}/);
                const date = dateMatch ? dateMatch[0] : '';
                
                // 이메일 패턴 찾기
                const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                const email = emailMatch ? emailMatch[0] : '';
                
                // *재판매 및 DB 금지 패턴 찾기
                const copyrightMatch = content.match(/\*재판매 및 DB 금지/);
                const copyright = copyrightMatch ? copyrightMatch[0] : '';
                
                // 본문에서 메타 정보들을 제거
                let mainContent = content
                  .replace(/\[([^\]]+)\]/, '')
                  .replace(/\(사진=[^)]+\)/, '')
                  .replace(/\d{4}\.\d{2}\.\d{2}/, '')
                  .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, '')
                  .replace(/\*재판매 및 DB 금지/, '')
                  .replace(/\.\s*\./g, '.') // 점 두 개를 점 한 개로 변경
                  .trim();
                
                return (
                  <>
                    {/* 메타 정보들 */}
                    {location && (
                      <div className="text-center text-sm text-gray-600 mb-4">
                        {location}
                      </div>
                    )}
                    
                    {/* 본문 내용 */}
                    {mainContent && (
                      <p className="text-center mb-4 text-xl">
                        {mainContent}
                      </p>
                    )}
                    
                    {/* 하단 메타 정보들 */}
                    {(photo || date || email || copyright) && (
                      <div className="text-center text-sm text-gray-600 mb-4">
                        {[photo, date, email, copyright].filter(Boolean).join(' ')}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* 퀴즈 버튼 */}
        <div className="mt-8 flex justify-center">
          <Link href="/todayquiz" className="inline-block w-full max-w-5xl">
            <button
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white font-bold text-xl shadow-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              오늘의 퀴즈 풀기
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 