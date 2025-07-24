"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// 임시 관리자 권한 체크 (실제 연동 시 서버에서 받아와야 함)
const isAdmin = true; // false로 바꾸면 일반 사용자 시나리오 테스트 가능

// mock 데이터
const mockUsers = [
  { id: 1, name: 'test1', email: 'test1@example.com' },
  { id: 2, name: 'test2', email: 'test2@example.com' },
  { id: 3, name: 'test3', email: 'test3@example.com' },
];
const mockNews = [
  { id: 1, title: '첫 번째 뉴스', author: 'test4', date: '2024-06-01' },
  { id: 2, title: '두 번째 뉴스', author: 'test5', date: '2024-06-02' },
  { id: 3, title: '세 번째 뉴스', author: 'test6', date: '2024-06-03' },
];

export default function AdminPage() {
  const router = useRouter();
  const [users] = useState(mockUsers);
  const [news, setNews] = useState(mockNews);

  useEffect(() => {
    if (!isAdmin) {
      alert('접근 권한이 없습니다');
      router.replace('/');
    }
  }, []);

  const handleDeleteNews = (id: number) => {
    if (window.confirm('정말로 이 뉴스를 삭제하시겠습니까?')) {
      setNews(news.filter((n) => n.id !== id));
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] flex flex-col items-center py-16">
      <div className="w-full max-w-4xl bg-white/90 rounded-3xl shadow-2xl p-12 flex flex-col gap-12 items-center">
        <h1 className="text-4xl font-extrabold text-[#7f9cf5] mb-4 tracking-widest">관리자 페이지</h1>
        {/* 회원 목록 */}
        <section className="w-full">
          <h2 className="text-2xl font-bold text-[#2b6cb0] mb-4">회원 조회</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#e6f1fb] text-[#2b6cb0]">
                  <th className="py-2 px-4">ID</th>
                  <th className="py-2 px-4">이름</th>
                  <th className="py-2 px-4">이메일</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-[#f7fafd]">
                    <td className="py-2 px-4">{user.id}</td>
                    <td className="py-2 px-4">{user.name}</td>
                    <td className="py-2 px-4">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {/* 뉴스 목록 */}
        <section className="w-full">
          <h2 className="text-2xl font-bold text-[#2b6cb0] mb-4">뉴스 조회 및 삭제</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#e6f1fb] text-[#2b6cb0]">
                  <th className="py-2 px-4">ID</th>
                  <th className="py-2 px-4">제목</th>
                  <th className="py-2 px-4">작성자</th>
                  <th className="py-2 px-4">날짜</th>
                  <th className="py-2 px-4">관리</th>
                </tr>
              </thead>
              <tbody>
                {news.map((n) => (
                  <tr key={n.id} className="border-b hover:bg-[#f7fafd]">
                    <td className="py-2 px-4">{n.id}</td>
                    <td className="py-2 px-4">{n.title}</td>
                    <td className="py-2 px-4">{n.author}</td>
                    <td className="py-2 px-4">{n.date}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => handleDeleteNews(n.id)}
                        className="px-3 py-1 rounded-full bg-red-400 text-white font-bold shadow hover:bg-red-600 transition-colors text-sm"
                      >삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
} 