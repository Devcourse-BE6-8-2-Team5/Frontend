"use client"
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// mock 데이터 (실제 API 연동 시 대체)
const mockNews = {
  title: '뉴스 제목 예시',
  content: '이곳에 뉴스의 상세 내용이 들어갑니다. 다양한 정보와 설명이 포함될 수 있습니다.',
  image: '/public/globe.svg', // 실제 이미지 경로로 대체
};

export default function NewsDetailPage() {
  const router = useRouter();

  const handleQuiz = () => {
    alert('퀴즈 페이지로 이동! (추후 구현)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] flex flex-col items-center py-16">
      <div className="w-full max-w-3xl bg-white/90 rounded-3xl shadow-2xl p-12 flex flex-col gap-12 items-center">
        {/* 뉴스 제목 */}
        <h1 className="text-3xl font-extrabold text-[#222] mb-8 text-center w-full">{mockNews.title}</h1>
        {/* 본문 영역 */}
        <div className="w-full min-h-[400px] flex flex-row gap-16 items-center justify-center bg-[#e6eaf3] rounded-2xl p-16">
          {/* 관련 이미지 */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <div className="w-80 h-64 bg-gradient-to-b from-gray-400 to-gray-300 rounded-3xl flex items-center justify-center">
              <span className="text-3xl font-extrabold text-white">관련 이미지</span>
            </div>
          </div>
          {/* 뉴스 내용 */}
          <div className="flex-1 min-h-[320px] text-3xl font-bold text-[#222] text-left px-8 flex items-center">
            {mockNews.content}
          </div>
        </div>
        {/* 상세 퀴즈 버튼 */}
        <div className="w-full flex flex-row justify-end">
          <button
            onClick={handleQuiz}
            className="px-6 py-2 rounded-lg bg-[#e6eaf3] text-[#222] font-semibold shadow hover:bg-[#bfe0f5] transition-colors"
          >상세 퀴즈 버튼</button>
        </div>
      </div>
    </div>
  );
} 