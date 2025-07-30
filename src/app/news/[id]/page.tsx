"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';

interface NewsDetail {
  id: number;
  title: string;
  content: string;
  originCreatedDate?: string;
  createdDate?: string;
  author?: string;
  source?: string;
  imgUrl?: string;
  imageUrl?: string;
}

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id;

  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!newsId) return;
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/news/${newsId}`);
        if (!res.ok) throw new Error('뉴스를 불러오지 못했습니다.');
        const data = await res.json();
        if (data.code !== 200 || !data.data) {
          throw new Error(data.message || '뉴스를 찾을 수 없습니다.');
        }
        setNews({ ...data.data, imageUrl: data.data.imgUrl });
      } catch (e: any) {
        setError(e.message || '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [newsId]);

  const handleQuiz = () => {
    router.push(`/news/${newsId}/quiz`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-lg text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-gray-500 text-lg">뉴스를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-8 px-4">
        <div className="w-full max-w-4xl bg-white/95 rounded-3xl shadow-xl p-10 flex flex-col gap-6 mb-10 border border-white/50 backdrop-blur-sm">
          <div className="text-center mb-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] mb-2">뉴스 상세</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] mx-auto rounded-full"></div>
          </div>
          {news.imageUrl && (
            <div className="w-full h-80 relative mb-6 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <Image
                src={news.imageUrl}
                alt="뉴스 이미지"
                fill
                className="object-contain w-full h-80 rounded-2xl bg-gray-50"
                priority
              />
            </div>
          )}
          
          <div className="text-3xl font-bold mb-4 text-center leading-tight text-[#1e3a8a]">{news.title}</div>
          
          <div className="flex flex-wrap gap-3 items-center justify-center mb-6 text-sm text-[#64748b]">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{news.originCreatedDate || news.createdDate}</span>
            </div>
            {news.author && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{news.author}</span>
              </div>
            )}
            {news.source && (
              <span className="px-3 py-1 bg-gradient-to-r from-[#e6f1fb] to-[#f0f7ff] rounded-full text-[#2b6cb0] font-semibold border border-[#7f9cf5]/20">
                {news.source}
              </span>
            )}
          </div>
          
          <div className="text-lg text-[#374151] leading-relaxed whitespace-pre-line bg-[#f8fafc] p-6 rounded-2xl border border-[#e0e7ef]/50">
            {news.content}
          </div>
        </div>
        <button
            onClick={handleQuiz}
            className="w-full max-w-4xl py-4 rounded-2xl bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          상세 퀴즈 풀러가기
        </button>
      </div>
  );
} 