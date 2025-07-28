"use client";
import { useState } from "react";
import { FaRegNewspaper } from "react-icons/fa";
import { useParams } from "next/navigation";

// 임시(목업) 데이터: 뉴스 제목 (실제로는 뉴스 ID로 API 호출)
const NEWS_TITLE = "AI가 만든 가짜뉴스와 진짜뉴스, 어떻게 구별할까?";

// 임시(목업) 데이터: 상세 퀴즈 3문제
const MOCK_QUIZZES = [
  {
    quiz_id: 201,
    question: "AI가 만든 가짜뉴스와 진짜뉴스를 구별하는 방법은?",
    option_a: "출처 확인",
    option_b: "AI가 만든 뉴스만 읽기",
    option_c: "아무거나 믿기",
  },
  {
    quiz_id: 202,
    question: "AI 뉴스의 위험성은?",
    option_a: "정보의 신뢰성 저하",
    option_b: "정보의 신뢰성 향상",
    option_c: "정보가 없어짐",
  },
  {
    quiz_id: 203,
    question: "가짜뉴스를 판별하는 데 도움이 되는 것은?",
    option_a: "AI 기반 진위 판별 서비스",
    option_b: "카더라 통신",
    option_c: "무작위 선택",
  },
];

export default function NewsQuizPage() {
  const params = useParams();
  const newsId = params.id;
  
  const [answers, setAnswers] = useState<{ [quizId: number]: string }>({});
  const [result, setResult] = useState<null | {
    details: { quiz_id: number; is_correct: boolean; user_answer: string; correct_option: string }[];
    correct_count: number;
    exp_gained: number;
    total_exp: number;
  }>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const CORRECT_OPTIONS: { [quizId: number]: string } = {
    201: "option_a",
    202: "option_a",
    203: "option_a",
  };

  const handleSubmit = () => {
    const details = MOCK_QUIZZES.map((q) => {
      const user_answer = answers[q.quiz_id];
      const correct_option = CORRECT_OPTIONS[q.quiz_id];
      return {
        quiz_id: q.quiz_id,
        is_correct: user_answer === correct_option,
        user_answer: user_answer || "",
        correct_option,
      };
    });
    const correct_count = details.filter((d) => d.is_correct).length;
    const exp_gained = correct_count * 2;
    const total_exp = 100 + exp_gained; // 임시 누적 경험치
    setResult({ details, correct_count, exp_gained, total_exp });
    setShowResult(true);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setQuizCompleted(true);
  };

  // 뉴스 정보 카드
  const NewsInfoCard = (
    <div className="w-full flex flex-col items-center bg-[#e6f1fb] rounded-xl p-5 mb-0 shadow-sm border border-[#d2eaff]">
      <div className="text-xs text-gray-500 text-center mb-2">상세 퀴즈는 해당 뉴스의 내용을 바탕으로 출제되었습니다.</div>
      <div className="flex items-center gap-2 mb-2">
        <FaRegNewspaper className="text-[#2b6cb0] text-xl" />
        <span className="text-[#2b6cb0] font-bold text-base">뉴스 상세</span>
      </div>
      <div className="text-lg sm:text-xl font-semibold text-[#222] text-center mb-1">{NEWS_TITLE}</div>
    </div>
  );

  // 퀴즈 완료 후 보여줄 UI
  if (quizCompleted && result) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-8 px-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-10">
          {NewsInfoCard}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b6cb0] text-center flex items-center justify-center gap-2 mb-6">
            상세 퀴즈
            <span className="bg-[#e6f1fb] text-[#2b6cb0] rounded-full px-3 py-1 text-sm font-semibold ml-2">완료</span>
          </h1>
          {MOCK_QUIZZES.map((quiz, idx) => {
            const d = result.details[idx];
            return (
              <div key={quiz.quiz_id} className="mb-4 w-full pb-4 border-b border-[#e6eaf3] bg-[#f7fafd] rounded-xl">
                <div className="font-bold text-lg mb-2 flex items-center justify-center gap-2">
                  <span>{idx + 1}. {quiz.question}</span>
                </div>
                <div className="flex flex-col gap-2 items-center justify-center text-center">
                  {["option_a", "option_b", "option_c"].map((opt) => {
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
                          name={`quiz_${quiz.quiz_id}`}
                          value={opt}
                          checked={isUser}
                          disabled
                        />
                        <span>{quiz[opt as "option_a" | "option_b" | "option_c"]}</span>
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
              <div className="text-xl font-bold text-[#2b6cb0]">3개 중 {result.correct_count}개</div>
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
          {MOCK_QUIZZES.map((quiz, idx) => (
            <div key={quiz.quiz_id} className="mb-8 w-full flex flex-col items-center">
              <div className="font-semibold mb-2 text-center w-full">{idx + 1}. {quiz.question}</div>
              <div className="flex flex-col gap-2 w-full items-center">
                {["option_a", "option_b", "option_c"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer w-full justify-center">
                    <input
                      type="radio"
                      name={`quiz_${quiz.quiz_id}`}
                      value={opt}
                      checked={answers[quiz.quiz_id] === opt}
                      onChange={() => setAnswers((prev) => ({ ...prev, [quiz.quiz_id]: opt }))}
                      disabled={!!result}
                    />
                    <span>{quiz[opt as "option_a" | "option_b" | "option_c"]}</span>
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
            disabled={Object.keys(answers).length !== 3}
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
              <div key={d.quiz_id} className="flex flex-col mb-2">
                <span>
                  {idx + 1}번 문제: {d.is_correct ? "정답" : "오답"}
                  <span className="ml-2 text-sm text-gray-500">
                    (내 답: {MOCK_QUIZZES[idx][d.user_answer as "option_a" | "option_b" | "option_c"] || "-"}
                    { !d.is_correct && (
                      <> / 정답: {MOCK_QUIZZES[idx][d.correct_option as "option_a" | "option_b" | "option_c"]}</>
                    )}
                    )
                  </span>
                </span>
              </div>
            ))}
            <div className="mt-2 font-semibold">
              총 정답: <span className="text-[#2b6cb0]">3개 중 {result.correct_count}개</span><br />
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