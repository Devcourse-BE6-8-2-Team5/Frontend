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
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] mb-2 text-center">뉴스 상세</h1>
          {news.imageUrl && (
            <div className="w-full h-60 relative mb-4 rounded-xl overflow-hidden">
              <Image
                src={news.imageUrl}
                alt="뉴스 이미지"
                fill
                className="object-cover w-full h-60 rounded-xl"
                priority
              />
            </div>
          )}
          <div className="text-2xl font-bold mb-2 text-center">{news.title}</div>
          <div className="text-gray-500 text-sm mb-1 flex flex-wrap gap-2 items-center">
            <span>{news.originCreatedDate || news.createdDate}</span>
            {news.author && <span>· {news.author}</span>}
            {news.source && <span className="px-2 py-0.5 bg-[#e6f1fb] rounded text-[#2b6cb0] font-semibold ml-2">{news.source}</span>}
          </div>
          <div className="text-base text-gray-800 leading-relaxed whitespace-pre-line">{news.content}</div>
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