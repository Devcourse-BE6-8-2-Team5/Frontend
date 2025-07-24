"use client";
import { useState } from "react";

// 임시(목업) 데이터: 오늘의 퀴즈 3문제
const MOCK_QUIZZES = [
  {
    quiz_id: 101,
    question: "AI가 만든 가짜뉴스와 진짜뉴스를 구별하는 방법은?",
    option_a: "출처 확인",
    option_b: "AI가 만든 뉴스만 읽기",
    option_c: "아무거나 믿기",
  },
  {
    quiz_id: 102,
    question: "AI 뉴스의 위험성은?",
    option_a: "정보의 신뢰성 저하",
    option_b: "정보의 신뢰성 향상",
    option_c: "정보가 없어짐",
  },
  {
    quiz_id: 103,
    question: "가짜뉴스를 판별하는 데 도움이 되는 것은?",
    option_a: "AI 기반 진위 판별 서비스",
    option_b: "카더라 통신",
    option_c: "무작위 선택",
  },
];

export default function TodayQuizPage() {
  // 사용자의 선택 상태
  const [answers, setAnswers] = useState<{ [quizId: number]: string }>({});
  // 퀴즈 제출 결과 상태
  const [result, setResult] = useState<null | {
    details: { quiz_id: number; is_correct: boolean; user_answer: string; correct_option: string }[];
    correct_count: number;
    exp_gained: number;
    total_exp: number;
  }>(null);
  const [showResult, setShowResult] = useState(false);

  // 임시 정답 (실제 서버에서는 DailyQuiz에서 가져옴)
  const CORRECT_OPTIONS: { [quizId: number]: string } = {
    101: "option_a",
    102: "option_a",
    103: "option_a",
  };

  // 퀴즈 제출 핸들러 (임시 채점)
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

  // 팝업 닫기
  const handleCloseResult = () => {
    setShowResult(false);
    // 실제 서버 연동 시, 여기서 GET 요청을 다시 보내서 "이미 푼 퀴즈" UI로 리렌더링
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-20 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2b6cb0] mb-2">오늘의 퀴즈</h1>
        {MOCK_QUIZZES.map((quiz, idx) => (
          <div key={quiz.quiz_id} className="mb-4">
            <div className="font-semibold mb-2">{idx + 1}. {quiz.question}</div>
            <div className="flex flex-col gap-2">
              {["option_a", "option_b", "option_c"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
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
        {!result && (
          <button
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white font-bold text-lg shadow hover:opacity-90 transition"
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
              총 정답: {result.correct_count} / 3<br />
              이번에 얻은 경험치: {result.exp_gained}점<br />
              누적 경험치: {result.total_exp}점
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