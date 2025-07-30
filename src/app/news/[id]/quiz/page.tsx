"use client";
import { useEffect, useState } from "react";
import { FaRegNewspaper } from "react-icons/fa";
import { useParams } from "next/navigation";

interface DetailQuiz {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  correctOption: "OPTION1" | "OPTION2" | "OPTION3";
}

interface QuizResult {
  details: { idx: number; is_correct: boolean; user_answer: string; correct_option: string }[];
  correct_count: number;
  exp_gained: number;
  total_exp: number;
}

export default function NewsQuizPage() {
  const params = useParams();
  const newsId = params.id;
  const [quizzes, setQuizzes] = useState<DetailQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [idx: number]: string }>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // 뉴스 제목도 API로 받아오고 싶으면 추가 fetch 필요
  const [newsTitle, setNewsTitle] = useState<string>("");

  useEffect(() => {
    if (!newsId) return;
    const fetchQuizzes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/quiz/detail/news/${newsId}`);
        if (!res.ok) throw new Error("퀴즈를 불러오지 못했습니다.");
        const data = await res.json();
        if (data.code !== 200 || !data.data || data.data.length === 0) {
          throw new Error(data.message || "퀴즈가 없습니다.");
        }
        setQuizzes(data.data);
      } catch (e: any) {
        setError(e.message || "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [newsId]);

  // 뉴스 제목도 불러오기 (선택)
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

  const handleSubmit = async () => {
    try {
      // 각 퀴즈에 대해 백엔드에 히스토리 생성 요청 (실제 경험치 지급)
      const historyPromises = quizzes.map(async (quiz, idx) => {
        const user_answer = answers[idx];
        if (!user_answer) return null;

        const res = await fetch('/api/histories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            quizId: parseInt(newsId as string) * 100 + idx + 1, // 뉴스ID * 100 + 퀴즈 인덱스로 고유 ID 생성
            quizType: 'DETAIL',
            answer: user_answer
          })
        });

        if (!res.ok) {
          throw new Error('퀴즈 제출에 실패했습니다.');
        }

        return await res.json();
      });

      const historyResults = await Promise.all(historyPromises);
      
      // 결과 계산
      const details = quizzes.map((q, idx) => {
        const user_answer = answers[idx];
        const correct_option = q.correctOption;
        const historyResult = historyResults[idx];
        
        return {
          idx,
          is_correct: user_answer === correct_option,
          user_answer: user_answer || "",
          correct_option,
        };
      });
      
      const correct_count = details.filter((d) => d.is_correct).length;
      const exp_gained = correct_count * 100; // 백엔드에서 정답당 100점 지급
      const total_exp = 100 + exp_gained; // 임시 누적 경험치
      
      setResult({ details, correct_count, exp_gained, total_exp });
      setShowResult(true);
    } catch (error: any) {
      console.error('퀴즈 제출 오류:', error);
      alert('퀴즈 제출에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setQuizCompleted(true);
    
    // 퀴즈 완료 후 마이페이지 정보 새로고침을 위한 이벤트 발생
    window.dispatchEvent(new CustomEvent('quizCompleted'));
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-lg text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (quizCompleted && result) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-8 px-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-10">
          {NewsInfoCard}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] text-center flex items-center justify-center gap-2 mb-6">
            상세 퀴즈
            <span className="bg-[#e6f1fb] text-[#2b6cb0] rounded-full px-3 py-1 text-sm font-semibold ml-2">완료</span>
          </h1>
          {quizzes.map((quiz, idx) => {
            const d = result.details[idx];
            return (
              <div key={idx} className="mb-4 w-full pb-4 border-b border-[#e6eaf3] bg-[#f7fafd] rounded-xl">
                <div className="font-bold text-lg mb-2 flex items-center justify-center gap-2">
                  <span>{idx + 1}. {quiz.question}</span>
                </div>
                <div className="flex flex-col gap-2 items-center justify-center text-center">
                  {["OPTION1", "OPTION2", "OPTION3"].map((opt) => {
                    const isUser = d.user_answer === opt;
                    const isCorrect = d.correct_option === opt;
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 rounded px-2 py-1
                          ${isUser && !d.is_correct ? "text-red-600 font-bold" : ""}
                          ${isCorrect ? "text-green-700 font-bold" : ""}
                        `}
                      >
                        <input
                          type="radio"
                          name={`quiz_${idx}`}
                          value={opt}
                          checked={isUser}
                          disabled
                        />
                        <span>{quiz[opt.toLowerCase() as "option1" | "option2" | "option3"]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#f7fafd] rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-xs text-gray-500 mb-1">총 정답</div>
              <div className="text-xl font-bold text-[#2b6cb0]">{quizzes.length}개 중 {result.correct_count}개</div>
            </div>
            <div className="bg-[#e6f1fb] rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-xs text-gray-500 mb-1">상세 퀴즈 경험치</div>
              <div className="text-xl font-bold text-[#43e6b5]">+{result.exp_gained}점</div>
            </div>
            <div className="bg-[#f7fafd] rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-xs text-gray-500 mb-1">나의 누적 경험치</div>
              <div className="text-xl font-bold text-[#7f9cf5]">{result.total_exp}점</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-8 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-8 mb-10">
        {NewsInfoCard}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] mb-3 text-center">상세 퀴즈</h1>
        <div className="w-full flex flex-col items-center">
          {quizzes.map((quiz, idx) => (
            <div key={idx} className="mb-8 w-full flex flex-col items-center">
              <div className="font-semibold mb-2 text-center w-full">{idx + 1}. {quiz.question}</div>
              <div className="flex flex-col gap-2 w-full items-center">
                {["OPTION1", "OPTION2", "OPTION3"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer w-full justify-center">
                    <input
                      type="radio"
                      name={`quiz_${idx}`}
                      value={opt}
                      checked={answers[idx] === opt}
                      onChange={() => setAnswers((prev) => ({ ...prev, [idx]: opt }))}
                      disabled={!!result}
                    />
                    <span>{quiz[opt.toLowerCase() as "option1" | "option2" | "option3"]}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        {!result && (
          <button
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white font-bold text-lg shadow hover:opacity-90 transition mt-8"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== quizzes.length}
          >
            퀴즈 제출
          </button>
        )}
      </div>

      {/* 결과 팝업 */}
      {showResult && result && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[#2b6cb0] mb-2">퀴즈 결과</h2>
            {result.details.map((d, idx) => (
              <div key={d.idx} className="flex flex-col mb-2">
                <span>
                  {idx + 1}번 문제: {d.is_correct ? "정답" : "오답"}
                  <span className="ml-2 text-sm text-gray-500">
                    (내 답: {quizzes[idx][d.user_answer.toLowerCase() as "option1" | "option2" | "option3"] || "-"}
                    { !d.is_correct && (
                      <> / 정답: {quizzes[idx][d.correct_option.toLowerCase() as "option1" | "option2" | "option3"]}</>
                    )}
                    )
                  </span>
                </span>
              </div>
            ))}
            <div className="mt-2 font-semibold">
              총 정답: <span className="text-[#2b6cb0]">{quizzes.length}개 중 {result.correct_count}개</span><br />
              상세 퀴즈로 얻은 경험치: <span className="text-[#43e6b5]">{result.exp_gained}점</span><br />
              누적 경험치: <span className="text-[#7f9cf5]">{result.total_exp}점</span>
            </div>
            <button
              className="mt-4 w-full py-2 rounded-full bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white font-bold shadow hover:opacity-90 transition"
              onClick={handleCloseResult}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 