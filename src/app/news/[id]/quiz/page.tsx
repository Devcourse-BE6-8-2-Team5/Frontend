"use client";
import { useEffect, useState } from "react";
import { FaRegNewspaper } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";

// 서버에서 받는 퀴즈 정보
interface DetailQuizResDto {
  id: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  correctOption: "OPTION1" | "OPTION2" | "OPTION3";
}

// 서버에서 받는 퀴즈 + 히스토리 정보
interface DetailQuizWithHistory {
  detailQuizResDto: DetailQuizResDto;
  answer: string | null; // null이면 안 푼 퀴즈, null이 아니면 이미 푼 퀴즈
  correct: boolean; // 서버에서 correct로 오므로 맞춤
  gainExp: number;
  quizType: string;
}

// 퀴즈 제출 후 서버에서 받는 응답
interface DetailQuizAnswerDto {
  quizId: number;
  question: string;
  correctOption: "OPTION1" | "OPTION2" | "OPTION3";
  selectedOption: "OPTION1" | "OPTION2" | "OPTION3";
  isCorrect: boolean;
  gainExp: number;
  quizType: string;
}

export default function NewsQuizPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params.id;
  const [quizzes, setQuizzes] = useState<DetailQuizWithHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [quizId: number]: 'OPTION1' | 'OPTION2' | 'OPTION3' }>({});
  const [submitting, setSubmitting] = useState(false);

  // 뉴스 제목도 API로 받아오고 싶으면 추가 fetch 필요
  const [newsTitle, setNewsTitle] = useState<string>("");

  // 상세 퀴즈 조회 (뉴스 ID로 조회)
  useEffect(() => {
    if (!newsId) return;
    const fetchDetailQuizzes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/quiz/detail/news/${newsId}`, {
          credentials: 'include',
        });
        
        if (res.status === 401) {
          alert('로그인이 필요합니다.');
          router.push(`/login?redirect=${encodeURIComponent(`/news/${newsId}/quiz`)}`);
          return;
        }

        if (!res.ok) {
          throw new Error('상세 퀴즈를 가져오는데 실패했습니다.');
        }

        const result = await res.json();
        console.log('퀴즈 API 응답:', result);
        if (result.code === 200) {
          console.log('퀴즈 데이터:', result.data);
          
          // 서버에서 DetailQuizResDto 배열을 받았으므로, 각 퀴즈의 히스토리를 개별 조회
          const quizList = result.data;
          const quizzesWithHistory: DetailQuizWithHistory[] = [];
          
          for (const quiz of quizList) {
          try {
            const historyRes = await fetch(`/api/quiz/detail/${quiz.id}`, {
              credentials: 'include',
            });
              
            if (historyRes.ok) {
                 const historyResult = await historyRes.json();
                 console.log(`퀴즈 ${quiz.id} 히스토리 응답:`, historyResult);
                 if (historyResult.code === 200) {
                   console.log(`퀴즈 ${quiz.id} 히스토리 데이터:`, historyResult.data);
                   quizzesWithHistory.push(historyResult.data);
                 } else {
                   console.log(`퀴즈 ${quiz.id} 히스토리 없음, 기본값 설정`);
                   // 히스토리가 없으면 기본값으로 설정
                   quizzesWithHistory.push({
                     detailQuizResDto: quiz,
                     answer: null,
                     correct: false,
                     gainExp: 0,
                     quizType: 'DETAIL'
                   });
                 }
               } else {
                 console.log(`퀴즈 ${quiz.id} 히스토리 조회 실패, 기본값 설정`);
                 // 히스토리 조회 실패시 기본값으로 설정
                 quizzesWithHistory.push({
                   detailQuizResDto: quiz,
                   answer: null,
                   correct: false,
                   gainExp: 0,
                   quizType: 'DETAIL'
                 });
               }
            } catch (error) {
              console.error(`퀴즈 ${quiz.id} 히스토리 조회 실패:`, error);
                             // 에러시 기본값으로 설정
               quizzesWithHistory.push({
                 detailQuizResDto: quiz,
                 answer: null,
                 correct: false,
                 gainExp: 0,
                 quizType: 'DETAIL'
               });
            }
          }
          
          console.log('히스토리 포함 퀴즈 데이터:', quizzesWithHistory);
          setQuizzes(quizzesWithHistory);
        } else {
          throw new Error(result.message || '상세 퀴즈를 가져오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('상세 퀴즈 조회 오류:', err);
        setError(err instanceof Error ? err.message : '상세 퀴즈를 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetailQuizzes();
  }, [newsId, router]);

  // 뉴스 제목도 불러오기
  useEffect(() => {
    if (!newsId) return;
    const fetchNewsTitle = async () => {
      try {
        const res = await fetch(`/api/news/${newsId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.code === 200 && data.data && data.data.title) {
          setNewsTitle(data.data.title);
        }
      } catch {}
    };
    fetchNewsTitle();
  }, [newsId]);

  // 퀴즈 제출
  const submitQuiz = async (quizId: number, selectedOption: 'OPTION1' | 'OPTION2' | 'OPTION3'): Promise<DetailQuizAnswerDto> => {
    try {
      const response = await fetch(`/api/quiz/detail/submit/${quizId}?selectedOption=${selectedOption}`, {
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
    const validQuizzes = quizzes.filter(q => q.detailQuizResDto);
    const unsolvedQuizzes = validQuizzes.filter(q => !isQuizSolved(q));
    
    if (Object.keys(answers).length !== unsolvedQuizzes.length) {
      alert('모든 문제를 풀어주세요.');
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      // 각 퀴즈를 순차적으로 제출
      for (const quiz of validQuizzes) {
        if (isQuizSolved(quiz)) continue; // 이미 푼 퀴즈는 건너뛰기
        
        const selectedOption = answers[quiz.detailQuizResDto!.id];
        if (!selectedOption) continue;

        await submitQuiz(quiz.detailQuizResDto!.id, selectedOption);
      }
      
      // 제출 완료 후 퀴즈 상태를 다시 조회 (히스토리 포함)
      if (newsId) {
        const refreshRes = await fetch(`/api/quiz/detail/news/${newsId}`, {
          credentials: 'include',
        });
        if (refreshRes.ok) {
          const refreshResult = await refreshRes.json();
          if (refreshResult.code === 200) {
            // 서버에서 DetailQuizResDto 배열을 받았으므로, 각 퀴즈의 히스토리를 개별 조회
            const quizList = refreshResult.data;
            const quizzesWithHistory: DetailQuizWithHistory[] = [];
            
            for (const quiz of quizList) {
              try {
                const historyRes = await fetch(`/api/quiz/detail/${quiz.id}`, {
                  credentials: 'include',
                });
                
                if (historyRes.ok) {
                  const historyResult = await historyRes.json();
                  if (historyResult.code === 200) {
                    quizzesWithHistory.push(historyResult.data);
                  } else {
                    // 히스토리가 없으면 기본값으로 설정
                    quizzesWithHistory.push({
                      detailQuizResDto: quiz,
                      answer: null,
                      correct: false,
                      gainExp: 0,
                      quizType: 'DETAIL'
                    });
                  }
                } else {
                  // 히스토리 조회 실패시 기본값으로 설정
                  quizzesWithHistory.push({
                    detailQuizResDto: quiz,
                    answer: null,
                    correct: false,
                    gainExp: 0,
                    quizType: 'DETAIL'
                  });
                }
              } catch (error) {
                console.error(`퀴즈 ${quiz.id} 히스토리 조회 실패:`, error);
                // 에러시 기본값으로 설정
                quizzesWithHistory.push({
                  detailQuizResDto: quiz,
                  answer: null,
                  correct: false,
                  gainExp: 0,
                  quizType: 'DETAIL'
                });
              }
            }
            
            setQuizzes(quizzesWithHistory);
          }
        }
      }
    } catch (err) {
      console.error('퀴즈 제출 오류:', err);
      alert(err instanceof Error ? err.message : '퀴즈 제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 옵션 텍스트 가져오기
  const getOptionText = (quiz: DetailQuizResDto, option: 'OPTION1' | 'OPTION2' | 'OPTION3') => {
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
  const isQuizSolved = (quiz: DetailQuizWithHistory) => {
    return quiz.answer !== null;
  };

  // 모든 퀴즈를 푼 상태인지 확인
  const isAllQuizzesSolved = () => {
    return quizzes.filter(quiz => quiz.detailQuizResDto).every(quiz => isQuizSolved(quiz));
  };

  // 뉴스 정보 카드
  const NewsInfoCard = (
      <div className="w-full flex flex-col items-center bg-[#e6f1fb] rounded-xl p-5 mb-0 shadow-sm border border-[#d2eaff]">
        <div className="text-xs text-gray-500 text-center mb-2">상세 퀴즈는 해당 뉴스의 내용을 바탕으로 출제되었습니다.</div>
        <div className="flex items-center gap-2 mb-2">
          <FaRegNewspaper className="text-[#2b6cb0] text-xl" />
          <span className="text-[#2b6cb0] font-bold text-base">뉴스 상세</span>
        </div>
        <div className="text-lg sm:text-xl font-semibold text-[#222] text-center mb-1">{newsTitle}</div>
      </div>
  );

  // 로딩 상태
  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2b6cb0] mx-auto mb-4"></div>
          <p className="text-gray-600">상세 퀴즈를 불러오는 중...</p>
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
              상세 퀴즈
            </h1>

          {quizzes.map((quizData, idx) => {
            const quiz = quizData.detailQuizResDto;
            
            // quiz가 undefined인 경우 건너뛰기
            if (!quiz) {
              return null;
            }
            
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
                 {quizzes.length}개 중 {quizzes.filter(q => q.detailQuizResDto && q.correct).length}개
               </div>
              </div>
              <div className="bg-[#e6f1fb] rounded-xl p-4 flex flex-col items-center shadow">
                <div className="text-xs text-gray-500 mb-1">상세 퀴즈 경험치</div>
              <div className="text-xl font-bold text-[#43e6b5]">
                +{quizzes.filter(q => q.detailQuizResDto).reduce((sum, q) => sum + (Number(q.gainExp) || 0), 0)}점
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
  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-center">
          <div className="text-gray-600 mb-4">상세 퀴즈가 없습니다.</div>
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
              {Object.keys(answers).length} / {quizzes.filter(q => q.detailQuizResDto && !isQuizSolved(q)).length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#2b6cb0] h-2 rounded-full transition-all duration-300"
              style={{ width: `${quizzes.filter(q => q.detailQuizResDto && !isQuizSolved(q)).length ? (Object.keys(answers).length / quizzes.filter(q => q.detailQuizResDto && !isQuizSolved(q)).length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] mb-3 text-center">상세 퀴즈</h1>
        
          <div className="w-full flex flex-col items-center">
          {quizzes.map((quizData, idx) => {
            const quiz = quizData.detailQuizResDto;
            
            // quiz가 undefined인 경우 건너뛰기
            if (!quiz) {
              return null;
            }
            
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
            Object.keys(answers).length === quizzes.filter(q => q.detailQuizResDto && !isQuizSolved(q)).length && !submitting
              ? "bg-[#2b6cb0] text-white hover:bg-[#1e40af]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={submitAllQuizzes}
          disabled={Object.keys(answers).length !== quizzes.filter(q => q.detailQuizResDto && !isQuizSolved(q)).length || submitting}
        >
          {submitting 
            ? "제출 중..." 
            : Object.keys(answers).length === quizzes.filter(q => q.detailQuizResDto && !isQuizSolved(q)).length
              ? "퀴즈 제출하기" 
              : "모든 문제를 풀어주세요"
          }
                </button>
              </div>
      </div>
  );
} 