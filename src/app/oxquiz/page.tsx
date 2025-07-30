'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// 더미 카테고리/퀴즈 데이터
const dummyCategories = [
  { id: 'all', name: '전체' },
  { id: 'politics', name: '정치' },
  { id: 'culture', name: '문화' },
  { id: 'it', name: 'IT' },
  { id: 'economy', name: '경제' },
  { id: 'society', name: '사회' },
];

const dummyQuizzes = [
  { id: 1, category: 'politics', title: '정부, 새로운 정책 발표' },
  { id: 2, category: 'economy', title: '주식시장, 사상 최고치 경신' },
  { id: 3, category: 'society', title: 'AI, 일자리 대체 논란' },
  { id: 4, category: 'politics', title: '국회, 예산안 통과' },
  { id: 5, category: 'economy', title: '금리 인상, 시장 영향' },
  { id: 6, category: 'society', title: '기후변화, 극한 날씨 증가' },
  { id: 7, category: 'politics', title: '외교부, 새로운 협정 체결' },
  { id: 8, category: 'economy', title: '부동산 시장, 가격 변동' },
  { id: 9, category: 'culture', title: '한류, 세계적 인기 확산' },
  { id: 10, category: 'culture', title: '영화제, 새로운 작품 발표' },
  { id: 11, category: 'culture', title: '전시회, 현대미술 전시' },
  { id: 12, category: 'it', title: '새로운 AI 기술 개발' },
  { id: 13, category: 'it', title: '메타버스, 가상현실 발전' },
  { id: 14, category: 'it', title: '블록체인, 기술 혁신' },
  { id: 15, category: 'society', title: '교육제도, 개혁 논의' },
];

export default function OxQuizMainPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userQuizStatus, setUserQuizStatus] = useState<Record<number, { solved: boolean; isCorrect?: boolean }>>({});

  // 로컬스토리지에서 사용자 퀴즈 상태 불러오기
  useEffect(() => {
    const savedStatus = localStorage.getItem('userOxQuizStatus');
    console.log('로드된 퀴즈 상태:', savedStatus);
    if (savedStatus) {
      try {
        const parsedStatus = JSON.parse(savedStatus);
        console.log('파싱된 퀴즈 상태:', parsedStatus);
        setUserQuizStatus(parsedStatus);
      } catch (error) {
        console.error('퀴즈 상태 로드 오류:', error);
      }
    }
  }, []);

  const filteredQuizzes = selectedCategory === 'all'
    ? dummyQuizzes
    : dummyQuizzes.filter(q => q.category === selectedCategory);



  // 퀴즈 제출 후 상태 업데이트 (실제로는 API 응답 후 호출)
  const updateQuizStatus = (quizId: number, isCorrect: boolean, userAnswer: 'real' | 'fake') => {
    console.log('퀴즈 상태 업데이트 호출:', { quizId, isCorrect, userAnswer });
    const newStatus = {
      ...userQuizStatus,
      [quizId]: { solved: true, isCorrect, userAnswer }
    };
    console.log('새로운 퀴즈 상태:', newStatus);
    setUserQuizStatus(newStatus);
    
    // 로컬스토리지에 저장
    localStorage.setItem('userOxQuizStatus', JSON.stringify(newStatus));
    console.log('로컬스토리지에 저장됨:', localStorage.getItem('userOxQuizStatus'));
  };

  // 전역 함수로 등록 (다른 컴포넌트에서 호출 가능)
  useEffect(() => {
    (window as any).updateOxQuizStatus = updateQuizStatus;
    return () => {
      delete (window as any).updateOxQuizStatus;
    };
  }, [userQuizStatus]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-8 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] mb-2 text-center">OX 퀴즈</h1>
        <div className="flex flex-row gap-4 w-full justify-center mt-2 mb-6">
          {dummyCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-full border text-base font-semibold shadow transition-colors
                ${selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white border-transparent'
                  : 'bg-white/80 text-[#383838] border-[#e0e7ef] hover:bg-[#e0f7fa] hover:text-[#2b6cb0]'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <ul className="flex flex-col gap-4 w-full">
          {filteredQuizzes.length === 0 && (
            <li className="text-center text-gray-400 py-8">해당 카테고리의 퀴즈가 없습니다.</li>
          )}
          {filteredQuizzes.map(quiz => {
            const status = userQuizStatus[quiz.id];
            const isSolved = status?.solved;
            const isCorrect = status?.isCorrect;
            
            return (
              <li key={quiz.id} className="w-full">
                <Link 
                  href={`/oxquiz/detail/${quiz.id}`}
                  className={`block w-full p-6 rounded-xl shadow hover:scale-[1.02] transition-transform border cursor-pointer
                    ${isSolved 
                      ? 'bg-gradient-to-r from-[#f0f9ff] to-[#e0f2fe] border-[#0ea5e9]' 
                      : 'bg-gradient-to-r from-[#e6f1fb] to-[#f7fafd] border-[#e0e7ef]'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg sm:text-xl font-bold text-[#222]">{quiz.title}</span>
                      <span className="px-3 py-1 text-xs rounded-full bg-[#e6eaf3] text-[#2b6cb0] font-semibold">
                        {dummyCategories.find(c => c.id === quiz.category)?.name}
                      </span>
                    </div>
                    {isSolved && (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold
                          ${isCorrect 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                          }
                        `}>
                          {isCorrect ? '정답' : '오답'}
                        </span>
                        <span className="text-xs text-gray-500">완료</span>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
} 