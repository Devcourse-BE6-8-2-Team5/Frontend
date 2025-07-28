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
<<<<<<< HEAD
  characterImage?: string;
  password?: string; // 프론트에서만 사용
}

export default function MyPage() {
  const { isAuthenticated, user, checkAuth } = useAuth();
=======
}

export default function MyPage() {
  const { isAuthenticated, user } = useAuth();
>>>>>>> b0ee16a (work)
  const router = useRouter();
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
<<<<<<< HEAD
  const [form, setForm] = useState<MemberInfo & { password?: string } | null>(null);

  // 인증 확인 및 회원 정보 조회
  useEffect(() => {
    const checkAuthAndFetchInfo = async () => {
      // 먼저 인증 상태를 다시 확인
      await checkAuth();
      
      // 인증이 되지 않은 경우
      if (!isAuthenticated) {
        alert('로그인이 필요합니다.');
        router.replace('/login');
        return;
      }

      // 인증된 경우 회원 정보 조회
      fetchMemberInfo();
    };

    checkAuthAndFetchInfo();
  }, []);

  // 퀴즈 완료 이벤트 감지하여 정보 새로고침
  useEffect(() => {
    const handleQuizCompleted = () => {
      fetchMemberInfo();
    };

    window.addEventListener('quizCompleted', handleQuizCompleted);
    
    return () => {
      window.removeEventListener('quizCompleted', handleQuizCompleted);
    };
  }, []);
=======
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
>>>>>>> b0ee16a (work)

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

<<<<<<< HEAD
  const handleSave = async () => {
    if (form) {
      if (!form.password || form.password.length < 8) {
        alert('비밀번호는 8자 이상 입력해야 합니다.');
        return;
      }
      try {
        const response = await fetch('/api/members/info', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: form.name,
            password: form.password,
            email: form.email,
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || '회원 정보 수정에 실패했습니다.');
        }
        const data = await response.json();
        setMemberInfo(data.data);
        setForm(data.data);
        setEditing(false);
        alert('정보가 수정되었습니다.');
      } catch (e: any) {
        alert(e.message || '회원 정보 수정에 실패했습니다.');
      }
    }
  };

  const handleCancel = () => {
    if (memberInfo) {
      setForm(memberInfo);
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 탈퇴하시겠습니까?')) {
      try {
        const response = await fetch('/api/members/withdraw', {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || '탈퇴에 실패했습니다.');
        }
        // 로그아웃 처리
        await fetch('/api/members/logout', {
          method: 'DELETE',
          credentials: 'include',
        });
        alert('탈퇴되었습니다.');
        router.replace('/');
      } catch (e: any) {
        alert(e.message || '탈퇴에 실패했습니다.');
      }
    }
  };

=======
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

>>>>>>> b0ee16a (work)
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

<<<<<<< HEAD
  // 경험치 바 관련 (백엔드 로직과 일치)
  const calculateExpPercent = (exp: number, level: number) => {
    if (level === 1) return Math.min(exp, 50) * 2; // 0-50 exp = 0-100%
    else if (level === 2) return Math.min(exp - 50, 50) * 2; // 50-100 exp = 0-100%
    else if (level === 3) return 100; // 100+ exp = 100%
    return 0;
  };
  
  const expPercent = calculateExpPercent(memberInfo.exp, memberInfo.level);
=======
  // 경험치 바 관련
  const maxLevel = 3;
  const expPercent = Math.min(memberInfo.exp, 100);
>>>>>>> b0ee16a (work)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] flex flex-col items-center justify-center py-16 relative overflow-hidden">
      {/* 배경 장식 요소들 */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-[#7f9cf5]/20 to-[#43e6b5]/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-[#bfe0f5]/30 to-[#8fa4c3]/30 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-br from-[#43e6b5]/25 to-[#7f9cf5]/25 rounded-full blur-lg animate-bounce"></div>
      
      <div className="w-full max-w-5xl min-h-[700px] bg-gradient-to-br from-[#bfe0f5] via-[#8fa4c3] via-60% to-[#e6f1fb] rounded-3xl shadow-2xl p-12 flex flex-col items-center justify-start relative overflow-hidden">
        {/* 상단 장식 라인 */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#7f9cf5] via-[#43e6b5] to-[#7f9cf5]"></div>
        
        {/* 팝업 내부 상단에 마이페이지 타이틀 */}
        <div className="w-full flex flex-col items-center mb-10">
          <div className="relative">
            <div className="text-5xl font-extrabold text-[#fff] drop-shadow-lg mb-2 tracking-widest animate-pulse">
              마이페이지
            </div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-[#43e6b5] to-[#7f9cf5] rounded-full animate-ping"></div>
          </div>
          <div className="text-lg text-white/80 font-medium">나의 정보와 성장을 확인해보세요</div>
        </div>
        <div className="w-full flex flex-col gap-10 items-center">
          {/* 내 정보 */}
<<<<<<< HEAD
          <div className="w-full bg-white/90 rounded-3xl p-10 flex flex-col items-center shadow-xl border border-white/50 backdrop-blur-sm relative overflow-hidden">
            {/* 카드 상단 장식 */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5]"></div>
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-[#7f9cf5] to-[#43e6b5] rounded-full opacity-20"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-[#7f9cf5] to-[#43e6b5] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-[#2b6cb0]">내 정보</div>
            </div>
=======
          <div className="w-full bg-white/80 rounded-2xl p-10 flex flex-col items-center shadow-md">
            <div className="text-2xl font-bold text-[#2b6cb0] mb-4">내 정보</div>
>>>>>>> b0ee16a (work)
            
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
                <div className="flex flex-col gap-2">
                  <label className="text-[#2b6cb0] font-semibold">비밀번호</label>
                  <input
                    name="password"
                    type="password"
                    value={form?.password || ''}
                    onChange={handleChange}
                    className="px-4 py-2 rounded-xl border border-[#e0e7ef] focus:outline-none focus:ring-2 focus:ring-[#7f9cf5] bg-white/90 text-[#383838] font-medium shadow"
                    placeholder="10자 이상 입력"
                  />
                </div>
                <div className="flex flex-row gap-4 mt-8 w-full justify-end items-center">
                  <button
                    onClick={handleSave}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    저장
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-8 py-3 rounded-full bg-white/90 text-[#383838] border-2 border-[#e0e7ef] font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
<<<<<<< HEAD
                <div className="w-full space-y-4 mb-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#f8fafc] to-[#e6f1fb] rounded-2xl border border-[#e0e7ef]/50">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#7f9cf5] to-[#43e6b5] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-[#64748b] font-medium">이름</div>
                      <div className="text-lg text-[#2b6cb0] font-semibold">{memberInfo.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#f8fafc] to-[#e6f1fb] rounded-2xl border border-[#e0e7ef]/50">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#7f9cf5] to-[#43e6b5] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-[#64748b] font-medium">이메일</div>
                      <div className="text-lg text-[#2b6cb0] font-semibold">{memberInfo.email}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row gap-4 w-full justify-end items-center">
=======
                <div className="text-xl text-[#383838] font-semibold mb-1">이름: <span className="font-normal">{memberInfo.name}</span></div>
                <div className="text-xl text-[#383838] font-semibold mb-4">이메일: <span className="font-normal">{memberInfo.email}</span></div>
                <div className="flex flex-row gap-4 mt-2 w-full justify-end items-center">
>>>>>>> b0ee16a (work)
                  <button
                    onClick={handleEdit}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    내 정보 수정
                  </button>
                </div>
              </>
            )}
          </div>
          {/* 캐릭터 & 레벨/경험치 */}
          <div className="w-full bg-white/90 rounded-3xl p-10 flex flex-col items-center shadow-xl border border-white/50 backdrop-blur-sm relative overflow-hidden">
            {/* 카드 상단 장식 */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5]"></div>
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-[#7f9cf5] to-[#43e6b5] rounded-full opacity-20"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-[#7f9cf5] to-[#43e6b5] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-[#2b6cb0]">성장 현황</div>
            </div>
            
            <div className="w-full flex flex-col items-center gap-8">
              {/* 캐릭터(아바타) */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#7f9cf5] via-[#43e6b5] to-[#bfe0f5] flex items-center justify-center shadow-2xl border-4 border-white overflow-hidden animate-pulse">
                  <span className="text-8xl select-none transform hover:scale-110 transition-transform duration-300">{memberInfo.characterImage || "🐣"}</span>
                </div>
                {/* 캐릭터 주변 장식 */}
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-[#43e6b5] to-[#7f9cf5] rounded-full animate-ping"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-br from-[#7f9cf5] to-[#43e6b5] rounded-full animate-ping delay-500"></div>
              </div>
              
              {/* 레벨/경험치 바 */}
              <div className="w-full max-w-md">
                <div className="flex flex-row justify-between w-full text-lg text-[#2b6cb0] font-bold mb-4">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-br from-[#7f9cf5] to-[#43e6b5] rounded-full"></div>
                    1레벨
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-br from-[#43e6b5] to-[#7f9cf5] rounded-full"></div>
                    2레벨
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-br from-[#7f9cf5] to-[#43e6b5] rounded-full"></div>
                    3레벨
                  </span>
                </div>
                <div className="relative w-full h-8 bg-white/60 rounded-full overflow-hidden shadow-inner mb-6 border-2 border-[#e0e7ef]">
                  <div
                    className="absolute left-0 top-0 h-8 bg-gradient-to-r from-[#7f9cf5] via-[#43e6b5] to-[#bfe0f5] rounded-full transition-all duration-1000 ease-out border border-white/50"
                    style={{ width: `${Math.max(expPercent, 5)}%` }}
                  />
                  {/* 경험치 바 내부 반짝이는 효과 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  {/* 디버깅용 텍스트 */}
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-[#2b6cb0] font-bold">
                    {expPercent}% (EXP: {memberInfo.exp}, Level: {memberInfo.level})
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gradient-to-r from-[#f8fafc] to-[#e6f1fb] rounded-2xl border border-[#e0e7ef]/50">
                    <div className="text-sm text-[#64748b] font-medium mb-1">현재 경험치</div>
                    <div className="text-2xl text-[#2b6cb0] font-bold">{memberInfo.exp}</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-[#f8fafc] to-[#e6f1fb] rounded-2xl border border-[#e0e7ef]/50">
                    <div className="text-sm text-[#64748b] font-medium mb-1">현재 레벨</div>
                    <div className="text-2xl text-[#2b6cb0] font-bold">{memberInfo.level}</div>
                  </div>
                </div>
              </div>
<<<<<<< HEAD
=======
              <div className="text-lg text-[#2b6cb0] font-semibold">현재 경험치: {memberInfo.exp} / 100</div>
              <div className="text-lg text-[#2b6cb0] font-semibold">현재 레벨: {memberInfo.level}</div>
>>>>>>> b0ee16a (work)
            </div>
          </div>
        </div>
        {/* 탈퇴 버튼 */}
        <div className="w-full flex flex-row justify-end mt-8">
          <button
            onClick={handleDelete}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-red-400 to-red-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}