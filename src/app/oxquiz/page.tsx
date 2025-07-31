'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// NewsCategory enum (서버와 일치)
enum NewsCategory {
  POLITICS = 'POLITICS',
  ECONOMY = 'ECONOMY', 
  SOCIETY = 'SOCIETY',
  CULTURE = 'CULTURE',
  IT = 'IT'
}

// 카테고리 매핑
const categoryMap = {
  [NewsCategory.POLITICS]: '정치',
  [NewsCategory.ECONOMY]: '경제',
  [NewsCategory.SOCIETY]: '사회',
  [NewsCategory.CULTURE]: '문화',
  [NewsCategory.IT]: 'IT'
};

// 카테고리 옵션
const categoryOptions = [
  { id: 'all', name: '전체', value: null },
  { id: NewsCategory.POLITICS, name: '정치', value: NewsCategory.POLITICS },
  { id: NewsCategory.ECONOMY, name: '경제', value: NewsCategory.ECONOMY },
  { id: NewsCategory.SOCIETY, name: '사회', value: NewsCategory.SOCIETY },
  { id: NewsCategory.CULTURE, name: '문화', value: NewsCategory.CULTURE },
  { id: NewsCategory.IT, name: 'IT', value: NewsCategory.IT },
];

// FactQuiz 타입 정의
interface FactQuiz {
  id: number;
  question: string;
  realNewsTitle: string;
  newsCategory?: string; // 서버에서 카테고리 정보를 보내주는 경우
}

// API 응답 타입
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export default function OxQuizMainPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quizzes, setQuizzes] = useState<FactQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userQuizStatus, setUserQuizStatus] = useState<Record<number, { solved: boolean; isCorrect?: boolean }>>({});

  // 퀴즈 데이터 가져오기
  const fetchQuizzes = async (category?: NewsCategory) => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      let url = `${API_BASE_URL}/api/quiz/fact`;
      if (category) {
        url += `/category?category=${category}`;
      }
      
      console.log('API 요청 URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('서버 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('서버 응답 데이터:', result);
      
      if (result.code === 200) {
        setQuizzes(result.data);
      } else {
        throw new Error(result.message || '퀴즈 데이터를 가져오는데 실패했습니다.');
      }
      
    } catch (err) {
      console.error('퀴즈 데이터 가져오기 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

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

  // 페이지 로드 시 전체 퀴즈 데이터 가져오기
  useEffect(() => {
    fetchQuizzes();
  }, []);

  // 카테고리 변경 시 퀴즈 데이터 다시 가져오기
  useEffect(() => {
    if (selectedCategory === 'all') {
      fetchQuizzes();
    } else {
      const category = selectedCategory as NewsCategory;
      fetchQuizzes(category);
    }
  }, [selectedCategory]);

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
    <div className="min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] mb-0 text-center">OX 퀴즈</h1>
        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto -mt-2">
          진짜 뉴스와 AI가 생성한 가짜 뉴스 중 진짜를 찾아보세요!<br />
        </p>
        
        {/* 카테고리 필터 */}
        <div className="flex flex-row gap-4 w-full justify-center mt-2 mb-6">
          {categoryOptions.map((cat) => (
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

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2b6cb0]"></div>
            <span className="ml-2 text-gray-600">퀴즈를 불러오는 중...</span>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">오류가 발생했습니다</div>
            <div className="text-gray-600 text-sm">{error}</div>
            <button 
              onClick={() => {
                if (selectedCategory === 'all') {
                  fetchQuizzes();
                } else {
                  const category = selectedCategory as NewsCategory;
                  fetchQuizzes(category);
                }
              }}
              className="mt-4 px-4 py-2 bg-[#2b6cb0] text-white rounded-lg hover:bg-[#1e40af] transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 퀴즈 목록 */}
        {!loading && !error && (
          <div className="w-full">
            {quizzes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">
                  {selectedCategory === 'all' ? '퀴즈가 없습니다.' : '해당 카테고리의 퀴즈가 없습니다.'}
                </div>
                <div className="text-gray-300 text-sm">다른 카테고리를 선택해보세요!</div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {quizzes.map(quiz => {
                const status = userQuizStatus[quiz.id];
                const isSolved = status?.solved;
                const isCorrect = status?.isCorrect;
                
                return (
                  <Link 
                    key={quiz.id}
                    href={`/oxquiz/detail/${quiz.id}`}
                    className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02] border-2
                      ${isSolved 
                        ? isCorrect 
                          ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' 
                          : 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
                        : 'border-[#e0e7ef] hover:border-[#7f9cf5]'
                      }
                    `}
                  >
                    {/* 퀴즈 상태 배지 */}
                    {isSolved && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-md
                          ${isCorrect 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                          }
                        `}>
                          {isCorrect ? '✅ 정답!' : '❌ 오답'}
                        </div>
                      </div>
                    )}
                    
                    {/* 퀴즈 순서 */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="text-sm font-bold text-[#7f9cf5] bg-[#e6f1fb] px-2 py-1 rounded">
                        퀴즈 {quizzes.indexOf(quiz) + 1}
                      </span>
                    </div>
                    
                    {/* 퀴즈 내용 */}
                    <div className="p-6 pt-16 flex flex-col h-full">
                      
                      {/* 기사 제목 - 중앙 정렬 */}
                      <div className="text-center mb-6">
                        <div className="inline-block">
                          <h3 className="text-lg font-bold text-[#2b6cb0] group-hover:text-[#5a7bd8] transition-colors leading-tight px-6 py-3 bg-white border-2 border-[#7f9cf5] rounded-xl shadow-sm">
                            {quiz.realNewsTitle}
                          </h3>
                        </div>
                      </div>
                      

                      

                      
                      {/* 퀴즈 상태 */}
                      <div className="flex items-center justify-between mt-auto pt-6">
                        {isSolved ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">퀴즈 완료</span>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full
                              ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                            `}>
                              {isCorrect ? '정답입니다!' : '틀렸습니다.'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">아직 풀지 않음</span>
                        )}
                        
                        {/* 퀴즈 질문과 화살표 */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700">
                            {quiz.question}
                          </span>
                          <span className="text-[#7f9cf5] text-3xl font-black group-hover:text-[#5a7bd8] transition-colors -mt-2">
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 호버 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
} 