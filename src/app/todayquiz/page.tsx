"use client";
import { useState, useEffect } from "react";
import { FaRegNewspaper } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 서버 API 구조에 맞게 타입 정의 수정
interface DailyQuizDto {
  id: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  correctOption: 'OPTION1' | 'OPTION2' | 'OPTION3';
}

interface DailyQuizWithHistoryDto {
  dailyQuizDto: DailyQuizDto;
  answer: string | null; // null이면 안 푼 퀴즈, 값이 있으면 푼 퀴즈
  correct: boolean; // isCorrect → correct로 변경
  gainExp: number;
  quizType: string;
}

interface DailyQuizAnswerDto {
  quizId: number;
  question: string;
  correctOption: 'OPTION1' | 'OPTION2' | 'OPTION3';
  selectedOption: 'OPTION1' | 'OPTION2' | 'OPTION3';
  isCorrect: boolean;
  gainExp: number;
  quizType: string;
}

interface TodayNews {
  id: number;
  title: string;
  content: string;
  selectedDate: string;
}

export default function TodayQuizPage() {
  const router = useRouter();
  
  const [todayNews, setTodayNews] = useState<TodayNews | null>(null);
  const [dailyQuizzes, setDailyQuizzes] = useState<DailyQuizWithHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [quizId: number]: 'OPTION1' | 'OPTION2' | 'OPTION3' }>({});
  const [submitting, setSubmitting] = useState(false);

  // 오늘의 뉴스 조회
  const fetchTodayNews = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/news/today`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        // 서버에서 인증 필요 응답이 올 때만 로그인 페이지로 리다이렉트
        alert('로그인이 필요합니다.');
        router.push(`/login?redirect=${encodeURIComponent('/todayquiz')}`);
        return null;
      }

      if (!response.ok) {
        throw new Error('오늘의 뉴스를 가져오는데 실패했습니다.');
      }

      const result = await response.json();
      console.log('뉴스 API 응답:', result);
      if (result.code === 200) {
        console.log('뉴스 데이터:', result.data);
        setTodayNews(result.data);
        return result.data.id;
      } else {
        throw new Error(result.message || '오늘의 뉴스를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('오늘의 뉴스 조회 오류:', err);
      setError(err instanceof Error ? err.message : '오늘의 뉴스를 가져오는데 실패했습니다.');
      return null;
    }
  };

  // 오늘의 퀴즈 조회 (서버에서 DailyQuizWithHistoryDto 배열로 응답)
  const fetchDailyQuizzes = async (todayNewsId: number) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/quiz/daily/${todayNewsId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        setError('로그인이 필요합니다.');
        return;
      }

      if (!response.ok) {
        throw new Error('오늘의 퀴즈를 가져오는데 실패했습니다.');
      }

      const result = await response.json();
      console.log('퀴즈 API 응답:', result);
      if (result.code === 200) {
        console.log('퀴즈 데이터:', result.data);
        // 각 퀴즈의 isCorrect 값 확인
        if (result.data && Array.isArray(result.data)) {
          result.data.forEach((quiz: any, index: number) => {
            console.log(`퀴즈 ${index + 1}:`, {
              id: quiz.dailyQuizDto?.id,
              answer: quiz.answer,
              correct: quiz.correct, // isCorrect → correct로 변경
              gainExp: quiz.gainExp,
              correctOption: quiz.dailyQuizDto?.correctOption
            });
          });
        }
        setDailyQuizzes(result.data);
      } else {
        throw new Error(result.message || '오늘의 퀴즈를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('오늘의 퀴즈 조회 오류:', err);
      setError(err instanceof Error ? err.message : '오늘의 퀴즈를 가져오는데 실패했습니다.');
    }
  };

  // 퀴즈 제출 (서버 API에 맞게 수정)
  const submitQuiz = async (quizId: number, selectedOption: 'OPTION1' | 'OPTION2' | 'OPTION3') => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/quiz/daily/submit/${quizId}?selectedOption=${selectedOption}`, {
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
        console.log(`퀴즈 ${quizId} 제출 결과:`, {
          quizId: result.data?.quizId,
          selectedOption: result.data?.selectedOption,
          correctOption: result.data?.correctOption,
          correct: result.data?.correct, // isCorrect → correct로 변경
          gainExp: result.data?.gainExp
        });
        // 제출 완료 후 퀴즈 상태를 다시 조회
        if (todayNews?.id) {
          await fetchDailyQuizzes(todayNews.id);
        }
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
    if (Object.keys(answers).length !== dailyQuizzes.length) {
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
        const selectedOption = answers[quiz.dailyQuizDto.id];
        if (!selectedOption) continue;

        await submitQuiz(quiz.dailyQuizDto.id, selectedOption);
      }
    } catch (err) {
      console.error('퀴즈 제출 오류:', err);
      alert(err instanceof Error ? err.message : '퀴즈 제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 페이지 로드 시 스크롤을 맨 위로 올리기
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. 오늘의 뉴스 조회
        const todayNewsId = await fetchTodayNews();
        if (todayNewsId) {
          // 2. 오늘의 퀴즈 조회
          await fetchDailyQuizzes(todayNewsId);
        }
      } catch (err) {
        console.error('데이터 로드 오류:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    // 페이지 로드 시 바로 데이터 가져오기 (서버에서 인증/인가 처리)
    loadData();
  }, []);

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

    // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-70">
        <div className="text-center">
          {error.includes('로그인이 필요') || error.includes('401') ? (
            <>
              <div className="text-2xl font-bold text-[#2b6cb0] mb-4">오늘의 퀴즈를 풀려면 로그인이 필요해요!</div>
              <div className="text-gray-600 mb-6 text-lg">로그인하고 퀴즈에 도전해보세요.</div>
              <button
                onClick={() => router.push(`/login?redirect=${encodeURIComponent('/todayquiz')}`)}
                className="px-6 py-3 bg-[#7f9cf5] text-white rounded-lg hover:bg-[#5a7bd8] transition-colors font-semibold text-lg"
              >
                로그인하기
              </button>
            </>
          ) : (
            <>
              <div className="text-xl font-semibold text-red-600 mb-2">오류가 발생했습니다</div>
              <div className="text-gray-500 mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#7f9cf5] text-white rounded-lg hover:bg-[#5a7bd8] transition-colors"
              >
                다시 시도
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // 오늘의 뉴스 안내 카드
  const NewsInfoCard = todayNews && (
    <div className="w-full flex flex-col items-center bg-[#e6f1fb] rounded-xl p-5 mb-0 shadow-sm border border-[#d2eaff]">
      <div className="text-xs text-gray-500 text-center mb-2">오늘의 퀴즈는 오늘의 뉴스의 내용을 바탕으로 출제되었습니다.</div>
      <div className="flex items-center gap-2 mb-2">
        <FaRegNewspaper className="text-[#2b6cb0] text-xl" />
        <span className="text-[#2b6cb0] font-bold text-base">오늘의 뉴스</span>
      </div>
      <div className="text-lg sm:text-xl font-semibold text-[#222] text-center mb-1">{todayNews.title}</div>
    </div>
  );

  // 모든 퀴즈를 푼 상태인 경우 결과 화면 표시
  if (isAllQuizzesSolved()) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-8 px-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-10">
          {NewsInfoCard}
<<<<<<< HEAD
<<<<<<< HEAD
                     <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] text-center mb-6">
             오늘의 퀴즈
           </h1>
=======
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] text-center flex items-center justify-center gap-2 mb-6">
            오늘의 퀴즈
            <span className="bg-[#e6f1fb] text-[#2b6cb0] rounded-full px-3 py-1 text-sm font-semibold ml-2">완료</span>
          </h1>
>>>>>>> 5197ae5 (feat: 오늘의 퀴즈 서버 연동 완료)
=======
                     <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] text-center mb-6">
             오늘의 퀴즈
           </h1>
>>>>>>> 3d7364c (오늘의 뉴스,퀴즈 ui 수정)
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
<<<<<<< HEAD
<<<<<<< HEAD
                    {isCorrect ? `정답!` : '오답'}
=======
                    {isCorrect ? `정답! (+${quizData.gainExp}EXP)` : '오답'}
>>>>>>> 5197ae5 (feat: 오늘의 퀴즈 서버 연동 완료)
=======
                    {isCorrect ? `정답!` : '오답'}
>>>>>>> 3d7364c (오늘의 뉴스,퀴즈 ui 수정)
                  </span>
                </div>
              </div>
            );
          })}
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3d7364c (오늘의 뉴스,퀴즈 ui 수정)
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
<<<<<<< HEAD
            </div>
=======
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="bg-[#f7fafd] rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-xs text-gray-500 mb-1">퀴즈 완료</div>
              <div className="text-xl font-bold text-[#7f9cf5]">성공!</div>
            </div>
          </div>
>>>>>>> 5197ae5 (feat: 오늘의 퀴즈 서버 연동 완료)
=======
            </div>
>>>>>>> 3d7364c (오늘의 뉴스,퀴즈 ui 수정)
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
              {Object.keys(answers).length} / {dailyQuizzes.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#2b6cb0] h-2 rounded-full transition-all duration-300"
              style={{ width: `${dailyQuizzes.length ? (Object.keys(answers).length / dailyQuizzes.length) * 100 : 0}%` }}
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
<<<<<<< HEAD
<<<<<<< HEAD
                      {isCorrect ? `정답!` : '오답'}
=======
                      {isCorrect ? `정답! (+${quizData.gainExp}EXP)` : '오답'}
>>>>>>> 5197ae5 (feat: 오늘의 퀴즈 서버 연동 완료)
=======
                      {isCorrect ? `정답!` : '오답'}
>>>>>>> 3d7364c (오늘의 뉴스,퀴즈 ui 수정)
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