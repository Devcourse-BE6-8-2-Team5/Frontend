'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// 서버 응답 타입 정의
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 안 푼 퀴즈용 DTO
interface FactQuizDtoWithNewsContent {
  id: number;
  question: string;
  realNewsTitle: string;
  realNewsContent: string;
  fakeNewsContent: string;
  correctNewsType: 'REAL' | 'FAKE';
  quizType: string;
}

// 이미 푼 퀴즈용 DTO (퀴즈 데이터 + 풀이 기록)
interface FactQuizDtoWithUserAnswer {
  id: number;
  question: string;
  realNewsTitle: string;
  realNewsContent: string;
  fakeNewsContent: string;
  correctNewsType: 'REAL' | 'FAKE';
  quizType: string;
  // 사용자 풀이 기록
  selectedNewsType: 'REAL' | 'FAKE';
  isCorrect: boolean;
  gainExp: number;
}

interface FactQuizAnswerDto {
  quizId: number;
  question: string;
  selectedNewsType: 'REAL' | 'FAKE';
  correctNewsType: 'REAL' | 'FAKE';
  isCorrect: boolean;
  gainExp: number;
  quizType: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function OxQuizDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = params;
  const [quiz, setQuiz] = useState<FactQuizDtoWithNewsContent | FactQuizDtoWithUserAnswer | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [selected, setSelected] = useState<'real' | 'fake' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<FactQuizAnswerDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 퀴즈 데이터 가져오기
  const fetchQuizDetail = async (quizId: string) => {
    try {
      setLoading(true);
      setError(null);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const url = `${API_BASE_URL}/api/quiz/fact/${quizId}`;
      
      console.log('퀴즈 상세 API 요청 URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      console.log('서버 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('로그인이 필요합니다.');
        } else if (response.status === 404) {
          throw new Error('퀴즈를 찾을 수 없습니다.');
        } else {
          throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`);
        }
      }
      
      const result: ApiResponse<FactQuizDtoWithNewsContent | FactQuizDtoWithUserAnswer> = await response.json();
      console.log('서버 응답 데이터:', result);
      
      if (result.code === 200) {
        setQuiz(result.data);
        
        // 이미 푼 퀴즈인지 확인 (selectedNewsType 필드가 있으면 이미 푼 퀴즈)
        const hasUserAnswer = 'selectedNewsType' in result.data;
        setIsSolved(hasUserAnswer);
        
        console.log('퀴즈 상태:', hasUserAnswer ? '이미 푼 퀴즈' : '안 푼 퀴즈');
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

  useEffect(() => {
    const quizId = id;
    console.log('현재 퀴즈 ID:', quizId);
    
    // 서버에서 퀴즈 데이터 가져오기
    fetchQuizDetail(quizId);
  }, [id]);

  // 정답 제출 함수
  const submitAnswer = async (selectedAnswer: 'real' | 'fake') => {
    if (!quiz) return;
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const selectedNewsType = selectedAnswer === 'real' ? 'REAL' : 'FAKE';
      const url = `${API_BASE_URL}/api/quiz/fact/submit/${quiz.id}?selectedNewsType=${selectedNewsType}`;
      
      console.log('정답 제출 API 요청 URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      console.log('정답 제출 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('로그인이 필요합니다.');
        } else if (response.status === 400) {
          const errorResult = await response.json();
          if (errorResult.message && errorResult.message.includes('이미 퀴즈를 풀었습니다')) {
            throw new Error('이미 푼 퀴즈입니다.');
          }
        }
        throw new Error(`정답 제출 오류: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('정답 제출 응답 데이터:', result);
      
      if (result.code === 200) {
        setAnswerResult(result.data);
        setSubmitted(true);
        
        console.log('정답 제출 성공:', result.data);
      } else {
        throw new Error(result.message || '정답 제출에 실패했습니다.');
      }
    } catch (err) {
      console.error('정답 제출 오류:', err);
      setError(err instanceof Error ? err.message : '정답 제출 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = () => {
    if (!selected || !quiz) return;
    submitAnswer(selected);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-center">
          <div className="text-xl font-semibold text-[#2b6cb0] mb-2">퀴즈를 불러오는 중...</div>
          <div className="text-gray-500">잠시만 기다려주세요</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600 mb-2">오류가 발생했습니다</div>
          <div className="text-gray-500 mb-4">{error}</div>
          <button
            onClick={() => router.push('/oxquiz')}
            className="px-4 py-2 bg-[#7f9cf5] text-white rounded-lg hover:bg-[#5a7bd8] transition-colors"
          >
            OX퀴즈 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-600 mb-2">퀴즈를 찾을 수 없습니다</div>
          <button
            onClick={() => router.push('/oxquiz')}
            className="px-4 py-2 bg-[#7f9cf5] text-white rounded-lg hover:bg-[#5a7bd8] transition-colors"
          >
            OX퀴즈 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 이미 푼 퀴즈 화면
  if (isSolved) {
    const solvedQuiz = quiz as FactQuizDtoWithUserAnswer;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-10">
            <div className="flex items-center justify-between mb-0">
              <button
                onClick={() => router.push('/oxquiz')}
                className="flex items-center gap-2 px-4 py-2 text-[#2b6cb0] hover:text-[#1e40af] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-semibold">OX퀴즈목록</span>
              </button>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] text-center">OX 퀴즈</h2>
            <div className="bg-gradient-to-r from-[#e6f1fb] to-[#f7fafd] rounded-xl p-6 border border-[#e0e7ef] shadow-sm mt-8">
              <div className="text-xl sm:text-2xl font-bold text-[#222] text-center">{solvedQuiz.realNewsTitle}</div>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch justify-center">
              <div
                className={`flex-1 rounded-xl border-2 p-8 transition-all shadow-sm min-h-[300px] flex flex-col
                  ${solvedQuiz.selectedNewsType === 'REAL' ? (solvedQuiz.isCorrect ? 'ring-2 ring-green-400 border-[#7f9cf5] bg-[#e6f0ff]' : 'ring-2 ring-red-400 border-[#e0e7ef] bg-[#f7fafd]') : 'border-[#e0e7ef] bg-[#f7fafd]'}
                `}
              >
                <div className="font-semibold text-[#2b6cb0] mb-4 text-lg">뉴스 A</div>
                <div className="text-base text-gray-800 whitespace-pre-line flex-1 leading-relaxed">{solvedQuiz.realNewsContent}</div>
              </div>
              <div
                className={`flex-1 rounded-xl border-2 p-8 transition-all shadow-sm min-h-[300px] flex flex-col
                  ${solvedQuiz.selectedNewsType === 'FAKE' ? (!solvedQuiz.isCorrect ? 'ring-2 ring-green-400 border-[#7f9cf5] bg-[#e6f0ff]' : 'ring-2 ring-red-400 border-[#e0e7ef] bg-[#f7fafd]') : 'border-[#e0e7ef] bg-[#f7fafd]'}
                `}
              >
                <div className="font-semibold text-[#2b6cb0] mb-4 text-lg">뉴스 B</div>
                <div className="text-base text-gray-800 whitespace-pre-line flex-1 leading-relaxed">{solvedQuiz.fakeNewsContent}</div>
              </div>
            </div>
            <div className={`text-center text-lg font-semibold mt-2 ${solvedQuiz.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {solvedQuiz.isCorrect
                ? `정답! ${solvedQuiz.correctNewsType === 'REAL' ? '진짜 뉴스(A)' : '가짜 뉴스(B)'}를 맞췄어요.`
                : `오답! 정답은 ${solvedQuiz.correctNewsType === 'REAL' ? '진짜 뉴스(A)' : '가짜 뉴스(B)'}입니다.`}
            </div>
            <div className="mt-4 text-center text-gray-500">이미 푼 퀴즈입니다.</div>
            
            {/* 경험치 정보 */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#e6f1fb] rounded-xl p-4 flex flex-col items-center shadow">
                <div className="text-xs text-gray-500 mb-1">OX퀴즈 경험치</div>
                <div className="text-xl font-bold text-[#43e6b5]">+{solvedQuiz.gainExp}점</div>
              </div>
              <div className="bg-[#f7fafd] rounded-xl p-4 flex flex-col items-center shadow">
                <div className="text-xs text-gray-500 mb-1">나의 누적 경험치</div>
                <div className="text-xl font-bold text-[#7f9cf5]">{100 + solvedQuiz.gainExp}점</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 안 푼 퀴즈 화면
  const unsolvedQuiz = quiz as FactQuizDtoWithNewsContent;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-10">
          <div className="flex items-center justify-between mb-0">
            <button
              onClick={() => router.push('/oxquiz')}
              className="flex items-center gap-2 px-4 py-2 text-[#2b6cb0] hover:text-[#1e40af] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-semibold">OX퀴즈목록</span>
            </button>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] text-center">OX 퀴즈</h2>
          <div className="bg-gradient-to-r from-[#e6f1fb] to-[#f7fafd] rounded-xl p-6 border border-[#e0e7ef] shadow-sm mt-8">
            <div className="text-xl sm:text-2xl font-bold text-[#222] text-center">{unsolvedQuiz.realNewsTitle}</div>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch justify-center">
            <div
              onClick={() => !submitted && setSelected('real')}
              className={`flex-1 rounded-xl border-2 p-8 cursor-pointer transition-all shadow-sm min-h-[300px] flex flex-col
                ${selected === 'real' ? 'border-[#7f9cf5] bg-[#e6f0ff]' : 'border-[#e0e7ef] bg-[#f7fafd]'}
                ${submitted && answerResult?.selectedNewsType === 'REAL' && answerResult.isCorrect ? 'ring-2 ring-green-400' : ''}
                ${submitted && answerResult?.selectedNewsType === 'REAL' && !answerResult.isCorrect ? 'ring-2 ring-red-400' : ''}
              `}
            >
              <div className="font-semibold text-[#2b6cb0] mb-4 text-lg">뉴스 A</div>
              <div className="text-base text-gray-800 whitespace-pre-line flex-1 leading-relaxed">{unsolvedQuiz.realNewsContent}</div>
            </div>
            <div
              onClick={() => !submitted && setSelected('fake')}
              className={`flex-1 rounded-xl border-2 p-8 cursor-pointer transition-all shadow-sm min-h-[300px] flex flex-col
                ${selected === 'fake' ? 'border-[#7f9cf5] bg-[#e6f0ff]' : 'border-[#e0e7ef] bg-[#f7fafd]'}
                ${submitted && answerResult?.selectedNewsType === 'FAKE' && answerResult.correctNewsType === 'FAKE' ? 'ring-2 ring-green-400' : ''}
                ${submitted && answerResult?.selectedNewsType === 'FAKE' && answerResult.correctNewsType === 'REAL' ? 'ring-2 ring-red-400' : ''}
              `}
            >
              <div className="font-semibold text-[#2b6cb0] mb-4 text-lg">뉴스 B</div>
              <div className="text-base text-gray-800 whitespace-pre-line flex-1 leading-relaxed">{unsolvedQuiz.fakeNewsContent}</div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selected || submitted}
            className={`w-full py-3 rounded-full font-bold text-lg shadow transition
              ${selected && !submitted ? 'bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white hover:opacity-90' : 'bg-[#e6eaf3] text-gray-400 cursor-not-allowed'}`}
          >
            {submitted ? (answerResult?.isCorrect ? '정답입니다!' : '오답입니다!') : '제출'}
          </button>
          {submitted && answerResult && (
            <div className={`text-center text-lg font-semibold mt-2 ${answerResult.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {answerResult.isCorrect 
                ? `정답! ${answerResult.correctNewsType === 'REAL' ? '진짜 뉴스(A)' : '가짜 뉴스(B)'}를 맞췄어요.`
                : `오답! 정답은 ${answerResult.correctNewsType === 'REAL' ? '진짜 뉴스(A)' : '가짜 뉴스(B)'}입니다.`}
            </div>
          )}
          {submitted && (
            <div className="text-center text-sm text-gray-500 mt-2">
              OX퀴즈목록으로 돌아가서 다른 퀴즈를 풀어보세요!
            </div>
          )}
          
          {/* 제출 후 경험치 정보 표시 */}
          {submitted && answerResult && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#e6f1fb] rounded-xl p-4 flex flex-col items-center shadow">
                <div className="text-xs text-gray-500 mb-1">OX퀴즈 경험치</div>
                <div className="text-xl font-bold text-[#43e6b5]">+{answerResult.gainExp}점</div>
              </div>
              <div className="bg-[#f7fafd] rounded-xl p-4 flex flex-col items-center shadow">
                <div className="text-xs text-gray-500 mb-1">나의 누적 경험치</div>
                <div className="text-xl font-bold text-[#7f9cf5]">{100 + answerResult.gainExp}점</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 