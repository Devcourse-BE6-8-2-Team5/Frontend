"use client";
import { useState, useEffect } from "react";
import { FaRegNewspaper } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// 타입 정의
interface DailyQuizDto {
  id: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  correctOption: 'OPTION1' | 'OPTION2' | 'OPTION3';
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

// 서버 응답 타입 (퀴즈 풀이 전)
interface DailyQuizResponse {
  isCompleted: false;
  quizzes: DailyQuizDto[];
}

// 서버 응답 타입 (퀴즈 풀이 후)
interface DailyQuizCompletedResponse {
  isCompleted: true;
  quizResults: DailyQuizAnswerDto[];
  totalCorrect: number;
  totalExp: number;
}

interface TodayNews {
  id: number;
  title: string;
  content: string;
  selectedDate: string;
}

export default function TodayQuizPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [todayNews, setTodayNews] = useState<TodayNews | null>(null);
  const [quizData, setQuizData] = useState<DailyQuizResponse | DailyQuizCompletedResponse | null>(null);
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

  // 오늘의 퀴즈 조회 (서버에서 풀이 상태에 따라 다른 응답)
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

      if (!response.ok) {
        throw new Error('오늘의 퀴즈를 가져오는데 실패했습니다.');
      }

      const result = await response.json();
      console.log('퀴즈 API 응답:', result);
      if (result.code === 200) {
        console.log('퀴즈 데이터:', result.data);
        // 서버에서 이미 풀었냐 안 풀었냐에 따라 다른 구조로 보내줌
        setQuizData(result.data);
      } else {
        throw new Error(result.message || '오늘의 퀴즈를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('오늘의 퀴즈 조회 오류:', err);
      setError(err instanceof Error ? err.message : '오늘의 퀴즈를 가져오는데 실패했습니다.');
    }
  };

  // 모든 퀴즈 제출
  const submitAllQuizzes = async () => {
    if (!quizData || quizData.isCompleted || !('quizzes' in quizData)) {
      return;
    }

    if (Object.keys(answers).length !== (quizData?.quizzes?.length || 0)) {
      alert('모든 문제를 풀어주세요.');
      return;
    }

    // 이미 제출 중인 경우 중복 제출 방지
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      const results: { [quizId: number]: DailyQuizAnswerDto } = {};
      
      // 각 퀴즈를 순차적으로 제출
      for (const quiz of quizData?.quizzes || []) {
        const selectedOption = answers[quiz.id];
        if (!selectedOption) continue;

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${API_BASE_URL}/api/quiz/daily/submit/${quiz.id}?selectedOption=${selectedOption}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          // 에러 응답 내용 확인
          const errorText = await response.text();
          console.error(`퀴즈 ${quiz.id} 제출 실패:`, response.status, errorText);
          
          if (response.status === 400) {
            // 400 에러는 이미 제출된 퀴즈
            console.warn(`퀴즈 ${quiz.id}는 이미 제출되었습니다.`);
            // 이미 푼 퀴즈라면 퀴즈 상태를 다시 조회하여 결과 화면 표시
            if (todayNews?.id) {
              await fetchDailyQuizzes(todayNews.id);
            }
            return;
          }
          throw new Error(`퀴즈 ${quiz.id} 제출에 실패했습니다. (${response.status})`);
        }

        const result = await response.json();
        if (result.code === 200) {
          results[quiz.id] = result.data;
        } else {
          throw new Error(result.message || `퀴즈 ${quiz.id} 제출에 실패했습니다.`);
        }
      }

      // 제출 완료 후 퀴즈 상태를 다시 조회하여 결과 화면 표시
      if (todayNews?.id) {
        await fetchDailyQuizzes(todayNews.id);
      }
    } catch (err) {
      console.error('퀴즈 제출 오류:', err);
      alert(err instanceof Error ? err.message : '퀴즈 제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

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

    // 인증 상태가 확인된 후에만 데이터 로드
    if (isAuthenticated !== undefined) {
      if (!isAuthenticated) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }
      loadData();
    }
  }, [isAuthenticated, router]);

  // 퀴즈 완료 여부 확인 (제출 버튼을 통해 완료되므로 이 useEffect는 제거)

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

  // 퀴즈 완료 후 보여줄 UI (서버에서 완료된 데이터를 받아옴)
  if (quizData && 'isCompleted' in quizData && quizData.isCompleted) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-8 px-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-10">
          {NewsInfoCard}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] text-center flex items-center justify-center gap-2 mb-6">
            오늘의 퀴즈
            <span className="bg-[#e6f1fb] text-[#2b6cb0] rounded-full px-3 py-1 text-sm font-semibold ml-2">완료</span>
          </h1>
          {quizData.quizResults.map((result, idx) => {
            return (
              <div key={result.quizId} className="mb-4 w-full pb-4 border-b border-[#e6eaf3] bg-[#f7fafd] rounded-xl p-4">
                <div className="font-bold text-lg mb-4 flex items-center justify-center gap-2">
                  <span className="bg-[#2b6cb0] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-2">
                    {idx + 1}
                  </span>
                  {result.question}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(['OPTION1', 'OPTION2', 'OPTION3'] as const).map((option) => {
                    const isUser = result.selectedOption === option;
                    const isCorrect = result.correctOption === option;
                    const optionText = getOptionText({
                      id: result.quizId,
                      question: result.question,
                      option1: '', // 서버에서 받은 결과에는 옵션 텍스트가 없으므로 임시 처리
                      option2: '',
                      option3: '',
                      correctOption: result.correctOption
                    }, option);
                    const optionLabel = getOptionLabel(option);
                    
                    return (
                      <div
                        key={option}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isUser && !result.isCorrect 
                            ? "border-red-300 bg-red-50" 
                            : isCorrect 
                            ? "border-green-300 bg-green-50" 
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isUser && !result.isCorrect 
                              ? "bg-red-500 text-white" 
                              : isCorrect 
                              ? "bg-green-500 text-white" 
                              : "bg-gray-200 text-gray-600"
                          }`}>
                            {optionLabel}
                          </div>
                          <span className={`font-medium ${
                            isUser && !result.isCorrect 
                              ? "text-red-700" 
                              : isCorrect 
                              ? "text-green-700" 
                              : "text-gray-700"
                          }`}>
                            {optionText || `옵션 ${optionLabel}`}
                          </span>
                          {isUser && !result.isCorrect && (
                            <span className="ml-auto text-red-500 font-bold">✗</span>
                          )}
                          {isCorrect && (
                            <span className="ml-auto text-green-500 font-bold">✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#f7fafd] rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-xs text-gray-500 mb-1">총 정답</div>
              <div className="text-xl font-bold text-[#2b6cb0]">{quizData?.quizResults?.length || 0}개 중 {quizData?.totalCorrect || 0}개</div>
            </div>
            <div className="bg-[#e6f1fb] rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-xs text-gray-500 mb-1">오늘의 퀴즈 경험치</div>
              <div className="text-xl font-bold text-[#43e6b5]">+{quizData?.totalExp || 0}점</div>
            </div>
            <div className="bg-[#f7fafd] rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-xs text-gray-500 mb-1">퀴즈 완료</div>
              <div className="text-xl font-bold text-[#7f9cf5]">성공!</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // quizData가 null이거나 올바른 형태가 아닌 경우 처리
  if (!quizData || !('quizzes' in quizData) || !('isCompleted' in quizData)) {
    console.log('quizData 상태:', quizData);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-center">
          <div className="text-gray-600 mb-4">퀴즈 데이터를 불러올 수 없습니다.</div>
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
              {Object.keys(answers).length} / {quizData?.quizzes.length || 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#2b6cb0] h-2 rounded-full transition-all duration-300"
              style={{ width: `${quizData?.quizzes.length ? (Object.keys(answers).length / quizData.quizzes.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] mb-3 text-center">오늘의 퀴즈</h1>
        
        <div className="w-full flex flex-col items-center">
          {quizData?.quizzes?.map((quiz, idx) => {
            const isAnswered = answers[quiz.id];
            
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
            Object.keys(answers).length === (quizData?.quizzes.length || 0) && !submitting
                ? "bg-[#2b6cb0] text-white hover:bg-[#1e40af]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          onClick={submitAllQuizzes}
          disabled={Object.keys(answers).length !== (quizData?.quizzes.length || 0) || submitting}
        >
          {submitting 
            ? "제출 중..." 
            : Object.keys(answers).length === (quizData?.quizzes.length || 0)
              ? "퀴즈 제출하기" 
              : "모든 문제를 풀어주세요"
          }
          </button>
      </div>
    </div>
  );
} 