"use client";
import { useEffect, useState } from "react";
import { FaRegNewspaper } from "react-icons/fa";
import { useRouter } from "next/navigation";

// 서버에서 받는 퀴즈 정보
interface DailyQuizDto {
  id: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  correctOption: 'OPTION1' | 'OPTION2' | 'OPTION3';
}

// 서버에서 받는 퀴즈 + 히스토리 정보
interface DailyQuizWithHistoryDto {
  dailyQuizDto: DailyQuizDto;
  answer: string | null; // null이면 안 푼 퀴즈, 값이 있으면 푼 퀴즈
  correct: boolean; // isCorrect → correct로 변경
  gainExp: number;
  quizType: string;
}

// 퀴즈 제출 후 서버에서 받는 응답
interface DailyQuizAnswerDto {
  quizId: number;
  question: string;
  correctOption: 'OPTION1' | 'OPTION2' | 'OPTION3';
  selectedOption: 'OPTION1' | 'OPTION2' | 'OPTION3';
  isCorrect: boolean;
  gainExp: number;
  quizType: string;
}

// 오늘의 뉴스 정보
interface TodayNews {
  id: number;
  title: string;
  content: string;
  selectedDate: string;
}

export default function TodayQuizPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const router = useRouter();
  const [dailyQuizzes, setDailyQuizzes] = useState<DailyQuizWithHistoryDto[]>([]);
  const [todayNews, setTodayNews] = useState<TodayNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [quizId: number]: 'OPTION1' | 'OPTION2' | 'OPTION3' }>({});
  const [submitting, setSubmitting] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // 오늘의 뉴스 조회
  const fetchTodayNews = async () => {
    try {
      const res = await fetch('/api/news/today', {
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('오늘의 뉴스를 가져오는데 실패했습니다.');
      }

      const result = await res.json();
      console.log('오늘의 뉴스 API 응답:', result);
      if (result.code === 200) {
        console.log('오늘의 뉴스 데이터:', result.data);
        setTodayNews(result.data);
        return result.data;
      } else {
        throw new Error(result.message || '오늘의 뉴스를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('오늘의 뉴스 조회 오류:', err);
      setError(err instanceof Error ? err.message : '오늘의 뉴스를 가져오는데 실패했습니다.');
      throw err;
    }
  };

  // 오늘의 퀴즈 조회
  const fetchDailyQuizzes = async (todayNewsId: number) => {
    try {
      const res = await fetch(`/api/quiz/daily/${todayNewsId}`, {
        credentials: 'include',
      });
      
      if (res.status === 401) {
        setIsUnauthorized(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error('오늘의 퀴즈를 가져오는데 실패했습니다.');
      }

      const result = await res.json();
      console.log('오늘의 퀴즈 API 응답:', result);
      if (result.code === 200) {
        console.log('오늘의 퀴즈 데이터:', result.data);
        setDailyQuizzes(result.data);
      } else {
        throw new Error(result.message || '오늘의 퀴즈를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('오늘의 퀴즈 조회 오류:', err);
      setError(err instanceof Error ? err.message : '오늘의 퀴즈를 가져오는데 실패했습니다.');
    }
  };

  // 퀴즈 제출
  const submitQuiz = async (quizId: number, selectedOption: 'OPTION1' | 'OPTION2' | 'OPTION3'): Promise<DailyQuizAnswerDto> => {
    try {
      const response = await fetch(`/api/quiz/daily/submit/${quizId}?selectedOption=${selectedOption}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('퀴즈 제출에 실패했습니다.');
      }

      const result = await response.json();
      console.log(`퀴즈 ${quizId} 제출 응답:`, result);
      if (result.code === 200) {
        console.log(`퀴즈 ${quizId} 제출 결과:`, result.data);
        return result.data;
      } else {
        throw new Error(result.message || '퀴즈 제출에 실패했습니다.');
      }
    } catch (err) {
      console.error('퀴즈 제출 오류:', err);
      throw err;
    }
  };

  // 모든 퀴즈 제출
  const submitAllQuizzes = async () => {
    if (Object.keys(answers).length !== dailyQuizzes.filter(q => !isQuizSolved(q)).length) {
      alert('모든 문제를 풀어주세요.');
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      // 각 퀴즈를 순차적으로 제출
      for (const quiz of dailyQuizzes) {
        if (isQuizSolved(quiz)) continue; // 이미 푼 퀴즈는 건너뛰기
        
        const selectedOption = answers[quiz.dailyQuizDto.id];
        if (!selectedOption) continue;

        await submitQuiz(quiz.dailyQuizDto.id, selectedOption);
      }
      
      // 제출 완료 후 퀴즈 상태를 다시 조회
      if (todayNews) {
        await fetchDailyQuizzes(todayNews.id);
      }
    } catch (err) {
      console.error('퀴즈 제출 오류:', err);
      alert(err instanceof Error ? err.message : '퀴즈 제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const news = await fetchTodayNews();
        await fetchDailyQuizzes(news.id);
      } catch (err) {
        console.error('데이터 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  // 옵션 텍스트 가져오기
  const getOptionText = (quiz: DailyQuizDto, option: 'OPTION1' | 'OPTION2' | 'OPTION3') => {
    switch (option) {
      case 'OPTION1': return quiz.option1;
      case 'OPTION2': return quiz.option2;
      case 'OPTION3': return quiz.option3;
      default: return '';
    }
  };

  // 옵션 라벨 가져오기
  const getOptionLabel = (option: 'OPTION1' | 'OPTION2' | 'OPTION3') => {
    switch (option) {
      case 'OPTION1': return 'A';
      case 'OPTION2': return 'B';
      case 'OPTION3': return 'C';
      default: return '';
    }
  };

  // 이미 푼 퀴즈인지 확인
  const isQuizSolved = (quiz: DailyQuizWithHistoryDto) => {
    return quiz.answer !== null;
  };

  // 모든 퀴즈를 푼 상태인지 확인
  const isAllQuizzesSolved = () => {
    return dailyQuizzes.every(quiz => isQuizSolved(quiz));
  };

  // 뉴스 정보 카드
  const NewsInfoCard = (
    <div className="w-full flex flex-col items-center bg-[#e6f1fb] rounded-xl p-5 mb-0 shadow-sm border border-[#d2eaff]">
      <div className="text-xs text-gray-500 text-center mb-2">오늘의 퀴즈는 해당 뉴스의 내용을 바탕으로 출제되었습니다.</div>
      <div className="flex items-center gap-2 mb-2">
        <FaRegNewspaper className="text-[#2b6cb0] text-xl" />
        <span className="text-[#2b6cb0] font-bold text-base">오늘의 뉴스</span>
      </div>
      <div className="text-lg sm:text-xl font-semibold text-[#222] text-center mb-1">{todayNews?.title}</div>
    </div>
  );

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2b6cb0] mx-auto mb-4"></div>
          <p className="text-gray-600">오늘의 퀴즈를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 로그인이 필요한 경우
  if (isUnauthorized) {
    return (
      <div className="min-h-screen flex items-start justify-center pt-50 bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2b6cb0] to-[#43e6b5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
              <p className="text-gray-600">로그인하고 오늘의퀴즈에 도전해보세요!</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-gradient-to-r from-[#2b6cb0] to-[#43e6b5] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                로그인하기
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                메인페이지로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-center">
          <div className="text-red-500 mb-4">오류가 발생했습니다</div>
          <div className="text-gray-600 text-sm mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#2b6cb0] text-white rounded-lg hover:bg-[#1e40af] transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 모든 퀴즈를 푼 상태인 경우 결과 화면 표시
  if (isAllQuizzesSolved()) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-8 px-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-10">
          {NewsInfoCard}

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] text-center mb-6">
            오늘의 퀴즈
          </h1>

          {dailyQuizzes.map((quizData, idx) => {
            const quiz = quizData.dailyQuizDto;
            const userAnswer = quizData.answer as 'OPTION1' | 'OPTION2' | 'OPTION3';
            const isCorrect = quizData.correct;
            
            return (
              <div key={quiz.id} className="mb-4 w-full pb-4 border-b border-[#e6eaf3] bg-[#f7fafd] rounded-xl p-4">
                <div className="font-bold text-lg mb-4 flex items-center justify-center gap-2">
                  <span className="bg-[#2b6cb0] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-2">
                    {idx + 1}
                  </span>
                  {quiz.question}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(['OPTION1', 'OPTION2', 'OPTION3'] as const).map((option) => {
                    const isUser = userAnswer === option;
                    const isCorrectOption = quiz.correctOption === option;
                    const optionText = getOptionText(quiz, option);
                    const optionLabel = getOptionLabel(option);
                    
                    return (
                      <div
                        key={option}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isUser && !isCorrect 
                            ? "border-red-300 bg-red-50" 
                            : isCorrectOption 
                            ? "border-green-300 bg-green-50" 
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isUser && !isCorrect 
                              ? "bg-red-500 text-white" 
                              : isCorrectOption 
                              ? "bg-green-500 text-white" 
                              : "bg-gray-200 text-gray-600"
                          }`}>
                            {optionLabel}
                          </div>
                          <span className={`font-medium ${
                            isUser && !isCorrect 
                              ? "text-red-700" 
                              : isCorrectOption 
                              ? "text-green-700" 
                              : "text-gray-700"
                          }`}>
                            {optionText}
                          </span>
                          {isUser && !isCorrect && (
                            <span className="ml-auto text-red-500 font-bold">✗</span>
                          )}
                          {isCorrectOption && (
                            <span className="ml-auto text-green-500 font-bold">✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 text-center">
                  <span className={`text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? `정답!` : '오답'}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#f7fafd] rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-xs text-gray-500 mb-1">총 정답</div>
              <div className="text-xl font-bold text-[#2b6cb0]">
                {dailyQuizzes.length}개 중 {dailyQuizzes.filter(q => q.correct).length}개
              </div>
            </div>
            <div className="bg-[#e6f1fb] rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-xs text-gray-500 mb-1">오늘의 퀴즈 경험치</div>
              <div className="text-xl font-bold text-[#43e6b5]">
                +{dailyQuizzes.reduce((sum, q) => sum + q.gainExp, 0)}점
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                router.push('/');
                window.scrollTo(0, 0);
              }}
              className="px-6 py-3 bg-[#2b6cb0] text-white rounded-lg hover:bg-[#1e40af] transition-colors font-semibold"
            >
              메인페이지로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 퀴즈 데이터가 없는 경우 처리
  if (!dailyQuizzes || dailyQuizzes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-center">
          <div className="text-gray-600 mb-4">오늘의 퀴즈가 없습니다.</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#2b6cb0] text-white rounded-lg hover:bg-[#1e40af] transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-8 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-8 mb-10">
        {NewsInfoCard}
        
        {/* 진행 상황 표시 */}
        <div className="w-full mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">진행 상황</span>
            <span className="text-sm font-semibold text-[#2b6cb0]">
              {Object.keys(answers).length} / {dailyQuizzes.filter(q => !isQuizSolved(q)).length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#2b6cb0] h-2 rounded-full transition-all duration-300"
              style={{ width: `${dailyQuizzes.filter(q => !isQuizSolved(q)).length ? (Object.keys(answers).length / dailyQuizzes.filter(q => !isQuizSolved(q)).length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] mb-3 text-center">오늘의 퀴즈</h1>
        
        <div className="w-full flex flex-col items-center">
          {dailyQuizzes.map((quizData, idx) => {
            const quiz = quizData.dailyQuizDto;
            const isSolved = isQuizSolved(quizData);
            const isAnswered = answers[quiz.id];
            
            // 이미 푼 퀴즈인 경우 결과 표시
            if (isSolved) {
              const userAnswer = quizData.answer as 'OPTION1' | 'OPTION2' | 'OPTION3';
              const isCorrect = quizData.correct;
              
              return (
                <div key={quiz.id} className="mb-8 w-full">
                  <div className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="bg-[#2b6cb0] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    {quiz.question}
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">완료</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {(['OPTION1', 'OPTION2', 'OPTION3'] as const).map((option) => {
                      const isUser = userAnswer === option;
                      const isCorrectOption = quiz.correctOption === option;
                      const optionText = getOptionText(quiz, option);
                      const optionLabel = getOptionLabel(option);
                      
                      return (
                        <div
                          key={option}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isUser && !isCorrect 
                              ? "border-red-300 bg-red-50" 
                              : isCorrectOption 
                              ? "border-green-300 bg-green-50" 
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isUser && !isCorrect 
                                ? "bg-red-500 text-white" 
                                : isCorrectOption 
                                ? "bg-green-500 text-white" 
                                : "bg-gray-200 text-gray-600"
                            }`}>
                              {optionLabel}
                            </div>
                            <span className={`font-medium ${
                              isUser && !isCorrect 
                                ? "text-red-700" 
                                : isCorrectOption 
                                ? "text-green-700" 
                                : "text-gray-700"
                            }`}>
                              {optionText}
                            </span>
                            {isUser && !isCorrect && (
                              <span className="ml-auto text-red-500 font-bold">✗</span>
                            )}
                            {isCorrectOption && (
                              <span className="ml-auto text-green-500 font-bold">✓</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-center">
                    <span className={`text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? `정답!` : '오답'}
                    </span>
                  </div>
                </div>
              );
            }
            
            // 아직 안 푼 퀴즈인 경우 선택 가능한 UI 표시
            return (
              <div key={quiz.id} className="mb-8 w-full">
                <div className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-[#2b6cb0] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  {quiz.question}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(['OPTION1', 'OPTION2', 'OPTION3'] as const).map((option) => {
                    const isSelected = answers[quiz.id] === option;
                    const optionText = getOptionText(quiz, option);
                    const optionLabel = getOptionLabel(option);
                  
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          setAnswers(prev => ({ ...prev, [quiz.id]: option }));
                        }}
                        disabled={false}
                        className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-md hover:border-gray-300 ${
                          isSelected 
                            ? "border-[#2b6cb0] bg-[#e6f1fb]" 
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isSelected 
                              ? "bg-[#2b6cb0] text-white" 
                              : "bg-gray-200 text-gray-600"
                          }`}>
                            {optionLabel}
                          </div>
                          <span className={`font-medium ${
                            isSelected 
                              ? "text-[#2b6cb0]" 
                              : "text-gray-700"
                          }`}>
                            {optionText}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 제출 버튼 */}
        <button
          className={`w-full py-4 rounded-xl font-bold text-lg shadow transition-all ${
            Object.keys(answers).length === dailyQuizzes.filter(q => !isQuizSolved(q)).length && !submitting
              ? "bg-[#2b6cb0] text-white hover:bg-[#1e40af]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={submitAllQuizzes}
          disabled={Object.keys(answers).length !== dailyQuizzes.filter(q => !isQuizSolved(q)).length || submitting}
        >
          {submitting 
            ? "제출 중..." 
            : Object.keys(answers).length === dailyQuizzes.filter(q => !isQuizSolved(q)).length
              ? "퀴즈 제출하기" 
              : "모든 문제를 풀어주세요"
          }
        </button>
      </div>
    </div>
  );
} 