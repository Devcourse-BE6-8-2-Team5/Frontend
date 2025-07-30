"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 회원 타입
interface MemberWithInfoDto {
  id: number;
  name: string;
  email: string;
  exp: number;
  level: number;
  role: string;
  characterImage: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<MemberWithInfoDto | null>(null);
  const [users, setUsers] = useState<MemberWithInfoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [todayNewsId, setTodayNewsId] = useState<number | null>(null);

  // 내 정보(로그인/권한) 확인
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const res = await fetch("/api/members/info", { credentials: "include" });
        if (!res.ok) throw new Error("로그인이 필요합니다.");
        const data = await res.json();
        if (!data.data) throw new Error("로그인이 필요합니다.");
        setUser(data.data);
        if (data.data.role !== "ADMIN") {
          alert("관리자만 접근 가능합니다.");
          router.replace("/");
        }
      } catch (e) {
        alert("로그인이 필요합니다.");
        router.replace("/login");
      }
    };
    fetchMyInfo();
  }, [router]);

  // 회원 목록 조회
  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/members", { credentials: "include" });
        if (res.status === 403) {
          setError("관리자 권한이 필요합니다.");
          return;
        }
        if (res.status === 401) {
          setError("로그인이 필요합니다.");
          router.replace("/login");
          return;
        }
        if (!res.ok) throw new Error("회원 목록 조회 실패");
        const data = await res.json();
        setUsers(data.data);
      } catch (e: any) {
        setError(e.message || "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user, router]);

  // 뉴스 목록 조회
  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    const fetchNews = async () => {
      setNewsLoading(true);
      setNewsError(null);
      try {
        const res = await fetch("/api/news?page=1&size=10&direction=desc");
        if (!res.ok) throw new Error("뉴스 목록 조회 실패");
        const data = await res.json();
        setNews(data.data.content || []);
      } catch (e: any) {
        setNewsError(e.message || "알 수 없는 오류");
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, [user]);

  // 오늘의 뉴스 id 조회
  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    const fetchTodayNews = async () => {
      try {
        const res = await fetch("/api/admin/news/today", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.code === 200 && data.data && data.data.id) {
          setTodayNewsId(data.data.id);
        } else {
          setTodayNewsId(null);
        }
      } catch {
        setTodayNewsId(null);
      }
    };
    fetchTodayNews();
  }, [user, news]);

  // 뉴스 삭제
  const handleDeleteNews = async (newsId: number) => {
    if (!window.confirm('정말로 이 뉴스를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/admin/news/${newsId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || data.code !== 200) throw new Error(data.message || '뉴스 삭제 실패');
      alert('뉴스가 삭제되었습니다.');
      // 삭제 후 목록 새로고침
      setNews((prev) => prev.filter((n) => n.id !== newsId));
    } catch (e: any) {
      alert(e.message || '뉴스 삭제 실패');
    }
  };

  // 오늘의 뉴스 설정
  const handleSetTodayNews = async (newsId: number) => {
    try {
      const res = await fetch(`/api/admin/news/today/select/${newsId}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || data.code !== 200) throw new Error(data.message || '오늘의 뉴스 설정 실패');
      alert('오늘의 뉴스로 설정되었습니다!');
      setTodayNewsId(newsId);
    } catch (e: any) {
      alert(e.message || '오늘의 뉴스 설정 실패');
    }
  };

  if (!user || user.role !== "ADMIN") {
    return null; // 권한 없으면 아무것도 안 보여줌
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] flex flex-col items-center py-16">
      <div className="w-full max-w-7xl bg-white/90 rounded-3xl shadow-2xl p-12 flex flex-col gap-12 items-center">
        <h1 className="text-4xl font-extrabold text-[#7f9cf5] mb-4 tracking-widest">관리자 페이지</h1>
        <section className="w-full">
          <h2 className="text-2xl font-bold text-[#2b6cb0] mb-4">모든 회원 조회</h2>
          {loading ? (
            <div>로딩 중...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#e6f1fb] text-[#2b6cb0]">
                  <th className="py-2 px-4">ID</th>
                  <th className="py-2 px-4">이름</th>
                  <th className="py-2 px-4">이메일</th>
                  <th className="py-2 px-4">레벨</th>
                  <th className="py-2 px-4">경험치</th>
                  <th className="py-2 px-4">역할</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-[#f7fafd]">
                    <td className="py-2 px-4">{u.id}</td>
                    <td className="py-2 px-4">{u.name}</td>
                    <td className="py-2 px-4">{u.email}</td>
                    <td className="py-2 px-4">{u.level}</td>
                    <td className="py-2 px-4">{u.exp}</td>
                    <td className="py-2 px-4">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        {/* 뉴스 목록 섹션 */}
        <section className="w-full">
          <h2 className="text-2xl font-bold text-[#2b6cb0] mb-4">모든 뉴스 조회</h2>
          {newsLoading ? (
            <div>로딩 중...</div>
          ) : newsError ? (
            <div className="text-red-500">{newsError}</div>
          ) : news.length === 0 ? (
            <div className="text-gray-500">등록된 뉴스가 없습니다.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#e6f1fb] text-[#2b6cb0]">
                  <th className="py-2 px-4 w-16">ID</th>
                  <th className="py-2 px-4 flex-1">제목</th>
                  <th className="py-2 px-4 w-32">작성자</th>
                  <th className="py-2 px-4 w-32">날짜</th>
                  <th className="py-2 px-4 w-64">관리</th>
                </tr>
              </thead>
              <tbody>
                {news.map((n: any) => (
                  <tr key={n.id} className="border-b hover:bg-[#f7fafd]">
                    <td className="py-2 px-4 w-16">{n.id}</td>
                    <td className="py-2 px-4 flex-1 truncate">{n.title}</td>
                    <td className="py-2 px-4 w-32 truncate">{n.author || n.mediaName || '-'}</td>
                    <td className="py-2 px-4 w-32">{n.originCreatedDate || n.createdDate}</td>
                    <td className="py-2 px-4 w-64">
                      <div className="flex flex-row gap-2">
                        <button
                          onClick={() => handleSetTodayNews(n.id)}
                          className={`px-3 py-1 rounded-full font-bold shadow transition-colors text-sm whitespace-nowrap ${
                            todayNewsId === n.id
                              ? 'bg-green-500 text-white'
                              : 'bg-[#7f9cf5] text-white hover:bg-[#5a7bd8]'
                          }`}
                          disabled={todayNewsId === n.id}
                        >
                          {todayNewsId === n.id ? '오늘의 뉴스' : '오늘의 뉴스로 설정'}
                        </button>
                        <button
                          onClick={() => handleDeleteNews(n.id)}
                          className="px-3 py-1 rounded-full bg-red-400 text-white font-bold shadow hover:bg-red-600 transition-colors text-sm whitespace-nowrap"
                        >삭제</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
} 