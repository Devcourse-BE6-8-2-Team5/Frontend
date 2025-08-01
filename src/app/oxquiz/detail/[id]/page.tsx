'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";

// 서버 응답 타입 정의
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 서버에서 보내는 새로운 DTO 구조
interface FactQuizWithHistoryDto {
  factQuizDto: {
    id: number;
    question: string;
    realNewsTitle: string;
    realNewsContent: string;
    fakeNewsContent: string;
    correctNewsType: 'REAL' | 'FAKE';
    quizType: string;
  };
  answer: string | null; // null이면 안 푼 퀴즈, 값이 있으면 푼 퀴즈
  correct: boolean;
  gainExp: number;
}

// 정답 제출 응답 DTO (서버 응답에 맞게 수정)
interface FactQuizAnswerDto {
  quizId: number;
  question: string;
  selectedNewsType: 'REAL' | 'FAKE';
  correctNewsType: 'REAL' | 'FAKE';
  correct: boolean; // isCorrect에서 correct로 변경
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
  const { isAuthenticated } = useAuth();
  const { id } = params;
  const [quizData, setQuizData] = useState<FactQuizWithHistoryDto | null>(null);
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
      
      const result: ApiResponse<FactQuizWithHistoryDto> = await response.json();
      console.log('서버 응답 데이터:', result);
      
      if (result.code === 200) {
        setQuizData(result.data);
        
        // answer이 null이면 안 푼 퀴즈, 값이 있으면 푼 퀴즈
        const isSolved = result.data.answer !== null;
        console.log('퀴즈 상태:', isSolved ? '이미 푼 퀴즈' : '안 푼 퀴즈');
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
    // 인증 상태가 확인된 후에만 데이터 로드
    if (isAuthenticated !== undefined) {
      if (!isAuthenticated) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }
      
      const quizId = id;
      console.log('현재 퀴즈 ID:', quizId);
      
      // 서버에서 퀴즈 데이터 가져오기
      fetchQuizDetail(quizId);
    }
  }, [id, isAuthenticated]);

  // 정답 제출 함수
  const submitAnswer = async (selectedAnswer: 'real' | 'fake') => {
    if (!quizData) return;
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const selectedNewsType = selectedAnswer === 'real' ? 'REAL' : 'FAKE';
      const url = `${API_BASE_URL}/api/quiz/fact/submit/${quizData.factQuizDto.id}?selectedNewsType=${selectedNewsType}`;
      
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

  // 퀴즈 질문에 따라 결과 메시지를 생성하는 함수
  const getResultMessage = (correct: boolean, correctNewsType: 'REAL' | 'FAKE', question: string) => {
    if (correct) {
      return `${correctNewsType === 'REAL' ? '진짜 뉴스(A)' : '가짜 뉴스(B)'}를 맞혔어요.`;
    } else {
      // 퀴즈 질문에 따라 다른 오답 메시지
      if (question.includes('진짜')) {
        // "진짜 뉴스를 고르라"는 퀴즈에서 가짜를 골랐을 때
        return `진짜 뉴스는 ${correctNewsType === 'REAL' ? 'A' : 'B'}입니다!`;
      } else if (question.includes('가짜')) {
        // "가짜 뉴스를 고르라"는 퀴즈에서 진짜를 골랐을 때
        return `가짜 뉴스는 ${correctNewsType === 'FAKE' ? 'B' : 'A'}입니다!`;
      } else {
        // 기본 메시지
        return `정답은 ${correctNewsType === 'REAL' ? '진짜 뉴스(A)' : '가짜 뉴스(B)'}입니다.`;
      }
    }
  };

  const handleSubmit = () => {
    if (!selected || !quizData) return;
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
    // 로그인 관련 에러인지 확인
    const isLoginError = error.includes('로그인이 필요합니다') || error.includes('인증');
    
    return (
      <div className="min-h-screen flex items-start justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-70">
        <div className="text-center">
          {isLoginError ? (
            <>
              <div className="text-2xl font-bold text-[#2b6cb0] mb-4">OX퀴즈를 풀려면 로그인이 필요해요!</div>
              <div className="text-gray-600 mb-6 text-lg">로그인하고 퀴즈에 도전해보세요.</div>
              <button
                onClick={() => router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
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
                onClick={() => router.push('/oxquiz')}
                className="px-4 py-2 bg-[#7f9cf5] text-white rounded-lg hover:bg-[#5a7bd8] transition-colors"
              >
                OX퀴즈 목록으로 돌아가기
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!quizData) {
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

  // 이미 푼 퀴즈 화면 (answer이 null이 아님)
  if (quizData.answer !== null) {
    const correct = quizData.correct;
    const selectedNewsType = quizData.answer as 'REAL' | 'FAKE';
    
    // 디버깅용 로그
    console.log('=== 이미 푼 퀴즈 디버깅 ===');
    console.log('quizData:', quizData);
    console.log('correct:', correct);
    console.log('answer:', quizData.answer);
    console.log('gainExp:', quizData.gainExp);
    console.log('========================');
    
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
                                    <div className="mt-8">
             <div className="text-xl sm:text-2xl font-bold text-[#222] text-center">{quizData.factQuizDto.realNewsTitle}</div>
             <div className="text-lg font-semibold text-[#10b981] text-center mt-3">{quizData.factQuizDto.question}</div>
             <div className="w-full h-0.5 bg-gray-400 my-4"></div>
           </div>
            <div className="flex flex-col gap-6 w-full items-stretch justify-center">
                             <div
                 className={`w-full rounded-xl border-2 p-8 transition-all shadow-sm min-h-[200px] flex flex-col
                   ${selectedNewsType === 'REAL' ? (correct ? 'ring-2 ring-green-400 border-[#7f9cf5] bg-[#e6f0ff]' : 'ring-2 ring-red-400 border-[#e0e7ef] bg-[#f7fafd]') : 'border-[#e0e7ef] bg-[#f7fafd]'}
                 `}
               >
                                                                   <div className="font-semibold text-[#2b6cb0] mb-4 text-lg bg-[#e0f2fe] p-4 rounded-t-lg -m-8 mb-4 text-center">뉴스 A</div>
                 <div className="text-base text-gray-900 whitespace-pre-line flex-1 leading-relaxed font-medium pt-8 pb-6 px-6 rounded-lg">{quizData.factQuizDto.realNewsContent}</div>
              </div>
                             <div
                 className={`w-full rounded-xl border-2 p-8 transition-all shadow-sm min-h-[200px] flex flex-col
                   ${selectedNewsType === 'FAKE' ? (correct ? 'ring-2 ring-green-400 border-[#7f9cf5] bg-[#e6f0ff]' : 'ring-2 ring-red-400 border-[#e0e7ef] bg-[#f7fafd]') : 'border-[#e0e7ef] bg-[#f7fafd]'}
                 `}
               >
                                                                   <div className="font-semibold text-[#2b6cb0] mb-4 text-lg bg-[#e0f2fe] p-4 rounded-t-lg -m-8 mb-4 text-center">뉴스 B</div>
                 <div className="text-base text-gray-900 whitespace-pre-line flex-1 leading-relaxed font-medium pt-8 pb-6 px-6 rounded-lg">{quizData.factQuizDto.fakeNewsContent}</div>
              </div>
            </div>

            
                         {/* 결과 UI - POST 요청 후와 동일하게 */}
             <div className="mt-6 text-center">
               {/* 결과 아이콘 */}
               <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${correct ? 'bg-green-100' : 'bg-pink-100'}`}>
                 <span className={`text-2xl ${correct ? 'text-green-600' : 'text-red-600'}`}>
                   {correct ? '✓' : '✗'}
                 </span>
               </div>
               
               {/* 결과 메시지 */}
               <div className={`text-xl font-bold mb-2 ${correct ? 'text-green-700' : 'text-red-700'}`}>
                 {correct ? '정답입니다!' : '오답입니다'}
               </div>
              
              {/* 경험치 정보 */}
              <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">얻은 경험치</div>
                <div className="text-2xl font-bold text-blue-400">+{quizData.gainExp}점</div>
              </div>
            </div>
            
            <div className="mt-4 text-center text-gray-500">이미 푼 퀴즈입니다.</div>
          </div>
        </div>
      </div>
    );
  }

  // 안 푼 퀴즈 화면 (answer이 null)
  
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
                     <div className="mt-8">
             <div className="text-xl sm:text-2xl font-bold text-[#222] text-center">{quizData.factQuizDto.realNewsTitle}</div>
             <div className="text-lg font-semibold text-[#10b981] text-center mt-3">{quizData.factQuizDto.question}</div>
             <div className="w-full h-0.5 bg-gray-400 my-4"></div>
           </div>
          <div className="flex flex-col gap-6 w-full items-stretch justify-center">
            <div
              onClick={() => !submitted && setSelected('real')}
              className={`w-full rounded-xl border-2 p-8 cursor-pointer transition-all shadow-sm min-h-[200px] flex flex-col bg-white relative
                ${!submitted && selected === 'real' ? 'border-[#7f9cf5] bg-[#e6f0ff]' : 'border-gray-400'}
                ${submitted && answerResult?.selectedNewsType === 'REAL' ? 'border-[#7f9cf5] bg-[#e6f0ff]' : ''}
                ${submitted && answerResult?.selectedNewsType === 'REAL' && answerResult.correct ? 'border-green-500' : ''}
                ${submitted && answerResult?.selectedNewsType === 'REAL' && !answerResult.correct ? 'border-red-300' : ''}
              `}
            >
              {submitted && answerResult?.selectedNewsType === 'REAL' && (
                <div className="absolute inset-0 bg-gray-600 opacity-15 rounded-xl pointer-events-none" style={{ margin: '-2px' }}></div>
              )}
                             <div className="font-semibold text-[#2b6cb0] mb-4 text-lg bg-[#e0f2fe] p-4 rounded-t-lg -m-8 mb-4 text-center">뉴스 A</div>
              <div className="text-base text-gray-900 whitespace-pre-line flex-1 leading-relaxed font-medium pt-8 pb-6 px-6 rounded-lg">{quizData.factQuizDto.realNewsContent}</div>
            </div>
            <div
              onClick={() => !submitted && setSelected('fake')}
              className={`w-full rounded-xl border-2 p-8 cursor-pointer transition-all shadow-sm min-h-[200px] flex flex-col bg-white relative
                ${!submitted && selected === 'fake' ? 'border-[#7f9cf5] bg-[#e6f0ff]' : 'border-gray-400'}
                ${submitted && answerResult?.selectedNewsType === 'FAKE' ? 'border-[#7f9cf5] bg-[#e6f0ff]' : ''}
                ${submitted && answerResult?.selectedNewsType === 'FAKE' && answerResult.correctNewsType === 'FAKE' ? 'border-green-500' : ''}
                ${submitted && answerResult?.selectedNewsType === 'FAKE' && answerResult.correctNewsType !== 'FAKE' ? 'border-red-300' : ''}
              `}
            >
              {submitted && answerResult?.selectedNewsType === 'FAKE' && (
                <div className="absolute inset-0 bg-gray-600 opacity-15 rounded-xl pointer-events-none" style={{ margin: '-2px' }}></div>
              )}
                             <div className="font-semibold text-[#2b6cb0] mb-4 text-lg bg-[#e0f2fe] p-4 rounded-t-lg -m-8 mb-4 text-center">뉴스 B</div>
              <div className="text-base text-gray-900 whitespace-pre-line flex-1 leading-relaxed font-medium pt-8 pb-6 px-6 rounded-lg">{quizData.factQuizDto.fakeNewsContent}</div>
            </div>
          </div>
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={!selected}
              className={`w-full py-3 rounded-full font-bold text-lg shadow transition
                ${selected ? 'bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white hover:opacity-90' : 'bg-[#e6eaf3] text-gray-400 cursor-not-allowed'}`}
            >
              제출
            </button>
          )}
          
          {/* 새로운 결과 UI */}
          {submitted && answerResult && (
            <div className="mt-6 text-center">
                             {/* 결과 아이콘 */}
               <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${answerResult.correct ? 'bg-green-100' : 'bg-pink-100'}`}>
                 <span className={`text-2xl ${answerResult.correct ? 'text-green-600' : 'text-red-600'}`}>
                   {answerResult.correct ? '✓' : '✗'}
                 </span>
               </div>
               
               {/* 결과 메시지 */}
               <div className={`text-xl font-bold mb-2 ${answerResult.correct ? 'text-green-700' : 'text-red-700'}`}>
                 {answerResult.correct ? '정답입니다!' : '오답입니다'}
               </div>
               
               <div className="text-lg text-gray-700 mb-4">
                 {getResultMessage(answerResult.correct, answerResult.correctNewsType, quizData.factQuizDto.question)}
               </div>
               
               {/* 경험치 정보 */}
               <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                 <div className="text-sm text-gray-500 mb-1">얻은 경험치</div>
                 <div className="text-2xl font-bold text-blue-400">+{answerResult.gainExp}점</div>
               </div>
              
              {/* 안내 메시지 */}
              <div className="text-sm text-gray-600">
                OX퀴즈목록으로 돌아가서 다른 퀴즈를 풀어보세요!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 