"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface MemberInfo {
  id: number;
  name: string;
  email: string;
  exp: number;
  level: number;
  role: string;
}

export default function MyPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<MemberInfo | null>(null);

  // 인증 확인 및 회원 정보 조회
  useEffect(() => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      router.replace('/login');
      return;
    }

    fetchMemberInfo();
  }, [isAuthenticated, router]);

  const fetchMemberInfo = async () => {
    try {
      const response = await fetch('/api/members/info', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('회원 정보 조회에 실패했습니다.');
      }

      const data = await response.json();
      setMemberInfo(data.data);
      setForm(data.data);
    } catch (error) {
      setError('회원 정보를 불러오는데 실패했습니다.');
      console.error('회원 정보 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (form) {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = () => {
    if (form) {
      setMemberInfo(form);
      setEditing(false);
      alert('정보가 수정되었습니다.');
    }
  };

  const handleCancel = () => {
    if (memberInfo) {
      setForm(memberInfo);
      setEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('정말로 탈퇴하시겠습니까?')) {
      alert('탈퇴되었습니다.');
      // TODO: 실제 탈퇴 API 호출
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] flex flex-col items-center justify-center py-16">
        <div className="text-xl text-[#2b6cb0]">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] flex flex-col items-center justify-center py-16">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!memberInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] flex flex-col items-center justify-center py-16">
        <div className="text-xl text-red-500">회원 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  // 경험치 바 관련
  const maxLevel = 3;
  const expPercent = Math.min(memberInfo.exp, 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] flex flex-col items-center justify-center py-16">
      <div className="w-full max-w-4xl min-h-[600px] bg-gradient-to-b from-[#bfe0f5] via-[#8fa4c3] via-70% to-[#e6f1fb] rounded-3xl shadow-2xl p-12 flex flex-col items-center justify-start relative">
        {/* 팝업 내부 상단에 마이페이지 타이틀 */}
        <div className="w-full flex flex-col items-center mb-8">
          <div className="text-4xl font-extrabold text-[#fff] drop-shadow mb-2 tracking-widest">마이페이지</div>
        </div>
        <div className="w-full flex flex-col gap-10 items-center">
          {/* 내 정보 */}
          <div className="w-full bg-white/80 rounded-2xl p-10 flex flex-col items-center shadow-md">
            <div className="text-2xl font-bold text-[#2b6cb0] mb-4">내 정보</div>
            
            {editing ? (
              <div className="w-full flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#2b6cb0] font-semibold">이름</label>
                  <input
                    name="name"
                    value={form?.name || ''}
                    onChange={handleChange}
                    className="px-4 py-2 rounded-xl border border-[#e0e7ef] focus:outline-none focus:ring-2 focus:ring-[#7f9cf5] bg-white/90 text-[#383838] font-medium shadow"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#2b6cb0] font-semibold">이메일</label>
                  <input
                    name="email"
                    value={form?.email || ''}
                    onChange={handleChange}
                    className="px-4 py-2 rounded-xl border border-[#e0e7ef] focus:outline-none focus:ring-2 focus:ring-[#7f9cf5] bg-white/90 text-[#383838] font-medium shadow"
                  />
                </div>
                <div className="flex flex-row gap-4 mt-6 w-full justify-end items-center">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-full bg-[#7f9cf5] text-white font-bold shadow hover:bg-[#5a7bd8] transition-colors text-lg"
                  >저장</button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 rounded-full bg-white/80 text-[#383838] border border-[#e0e7ef] font-bold shadow hover:bg-[#e0f7fa] transition-colors text-lg"
                  >취소</button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-xl text-[#383838] font-semibold mb-1">이름: <span className="font-normal">{memberInfo.name}</span></div>
                <div className="text-xl text-[#383838] font-semibold mb-4">이메일: <span className="font-normal">{memberInfo.email}</span></div>
                <div className="flex flex-row gap-4 mt-2 w-full justify-end items-center">
                  <button
                    onClick={handleEdit}
                    className="px-6 py-2 rounded-full bg-[#7f9cf5] text-white font-bold shadow hover:bg-[#5a7bd8] transition-colors text-lg"
                  >내 정보 수정</button>
                </div>
              </>
            )}
          </div>
          {/* 캐릭터 & 레벨/경험치 */}
          <div className="w-full flex flex-col items-center gap-6 mt-2">
            {/* 캐릭터(아바타) */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-b from-[#7f9cf5] to-[#bfe0f5] flex items-center justify-center shadow-lg border-4 border-white">
              <span className="text-6xl select-none">🐣</span>
            </div>
            {/* 레벨/경험치 바 */}
            <div className="w-full flex flex-col items-center">
              <div className="flex flex-row justify-between w-full text-base text-[#2b6cb0] font-bold mb-2">
                <span>0레벨</span>
                <span>1레벨</span>
                <span>2레벨</span>
                <span>3레벨</span>
              </div>
              <div className="relative w-full h-6 bg-white/60 rounded-full overflow-hidden shadow-inner mb-3">
                <div
                  className="absolute left-0 top-0 h-6 bg-gradient-to-r from-[#7f9cf5] to-[#bfe0f5]"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
              <div className="text-lg text-[#2b6cb0] font-semibold">현재 경험치: {memberInfo.exp} / 100</div>
              <div className="text-lg text-[#2b6cb0] font-semibold">현재 레벨: {memberInfo.level}</div>
            </div>
          </div>
        </div>
        {/* 탈퇴 버튼 */}
        <div className="w-full flex flex-row justify-end mt-8">
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-full bg-red-400 text-white font-bold shadow hover:bg-red-600 transition-colors text-sm"
          >탈퇴</button>
        </div>
      </div>
    </div>
  );
}