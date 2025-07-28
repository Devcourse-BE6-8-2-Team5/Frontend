"use client"
import React from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';

// mock 데이터 (실제 API 연동 시 대체)
const mockNews = {
  title: 'AI가 만든 가짜뉴스와 진짜뉴스, 어떻게 구별할까?',
  content: `최근 AI 기술의 발달로 가짜뉴스가 더욱 정교해지고 있습니다. 이에 따라 진짜뉴스와 가짜뉴스를 구별하는 것이 점점 더 중요해지고 있습니다. 전문가들은 출처 확인, 맥락 파악, AI 기반 진위 판별 서비스 활용 등을 권장합니다.`,
  date: '2024-06-01',
  reporter: '홍길동 기자',
  source: '연합뉴스',
  image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
};

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id;

  const handleQuiz = () => {
    router.push(`/news/${newsId}/quiz`);
  };

  return (
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-8 px-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] mb-2 text-center">뉴스 상세</h1>
          {mockNews.image_url && (
              <div className="w-full flex justify-center mb-4">
                <Image src={mockNews.image_url} alt="뉴스 이미지" width={600} height={300} className="rounded-xl object-cover max-h-60 w-auto" />
              </div>
          )}
          <div className="text-2xl font-bold mb-2 text-center">{mockNews.title}</div>
          <div className="text-gray-500 text-sm mb-1 flex flex-wrap gap-2 items-center">
            <span>{mockNews.date}</span>
            <span>· {mockNews.reporter}</span>
            <span className="px-2 py-0.5 bg-[#e6f1fb] rounded text-[#2b6cb0] font-semibold ml-2">{mockNews.source}</span>
          </div>
          <div className="text-base text-gray-800 leading-relaxed whitespace-pre-line">{mockNews.content}</div>
        </div>
        <button
            onClick={handleQuiz}
            className="w-full max-w-4xl py-3 rounded-full bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white font-bold text-lg shadow hover:opacity-90 transition"
        >
          상세 퀴즈 풀러가기
        </button>
      </div>
  );
} 