'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// 더미 데이터 (실제에선 API로 받아오세요)
// 미풀이 상태: 제목, 진짜기사, 가짜기사만
const dummyQuizDetail: Record<string, {
  title: string;
  real: string;
  fake: string;
}> = {
  '1': {
    title: '정부, 새로운 정책 발표',
    real: '정부는 오늘 새로운 정책을 공식 발표했습니다. 이번 정책은...',
    fake: '정부는 오늘 모든 세금을 폐지한다고 발표했습니다. 이에 따라...',
  },
  '2': {
    title: '주식시장, 사상 최고치 경신',
    real: '오늘 주식시장은 사상 최고치를 기록하며 마감했습니다. 전문가들은...',
    fake: '오늘 주식시장은 모든 종목이 상한가를 기록했습니다. 투자자들은...',
  },
  '3': {
    title: 'AI, 일자리 대체 논란',
    real: 'AI 기술의 발전으로 일자리 대체에 대한 우려가 커지고 있습니다.',
    fake: 'AI가 모든 직업을 대체해 내일부터 모든 사람이 실직하게 됩니다.',
  },
  '4': {
    title: '국회, 예산안 통과',
    real: '국회에서 내년도 예산안이 통과되었습니다. 주요 내용은...',
    fake: '국회에서 모든 예산을 폐지하고 무상복지만 실시한다고 발표했습니다.',
  },
  '5': {
    title: '금리 인상, 시장 영향',
    real: '중앙은행의 금리 인상 결정으로 시장에 영향이 나타나고 있습니다.',
    fake: '중앙은행이 모든 이자를 폐지하고 무이자 대출을 실시한다고 발표했습니다.',
  },
  '6': {
    title: '기후변화, 극한 날씨 증가',
    real: '전 세계적으로 기후변화로 인한 극한 날씨 현상이 증가하고 있습니다.',
    fake: '내일부터 지구가 얼어붙어 모든 생명체가 멸종한다고 발표했습니다.',
  },
  '7': {
    title: '외교부, 새로운 협정 체결',
    real: '외교부는 새로운 국가와의 협정을 체결했습니다. 협정 내용은...',
    fake: '외교부가 모든 국가와의 외교관계를 단절한다고 발표했습니다.',
  },
  '8': {
    title: '부동산 시장, 가격 변동',
    real: '부동산 시장에서 가격 변동이 나타나고 있습니다. 전문가들은...',
    fake: '정부가 모든 부동산을 무상으로 분배한다고 발표했습니다.',
  },
  '9': {
    title: '한류, 세계적 인기 확산',
    real: '한류 문화가 전 세계적으로 인기를 얻고 있습니다. K팝과 K드라마는...',
    fake: '한국 문화가 전 세계에서 금지되어 모든 한류 콘텐츠가 차단됩니다.',
  },
  '10': {
    title: '영화제, 새로운 작품 발표',
    real: '국제영화제에서 새로운 작품들이 발표되었습니다. 주요 작품들은...',
    fake: '영화제에서 모든 영화를 폐지하고 연극만 상영한다고 발표했습니다.',
  },
  '11': {
    title: '전시회, 현대미술 전시',
    real: '현대미술관에서 새로운 전시회가 열렸습니다. 전시 작품들은...',
    fake: '모든 미술관을 폐쇄하고 그림 그리기를 금지한다고 발표했습니다.',
  },
  '12': {
    title: '새로운 AI 기술 개발',
    real: '연구진이 새로운 AI 기술을 개발했습니다. 이 기술은...',
    fake: 'AI가 모든 기술을 대체해 인간이 더 이상 발명할 수 없다고 발표했습니다.',
  },
  '13': {
    title: '메타버스, 가상현실 발전',
    real: '메타버스 기술이 발전하여 가상현실 경험이 향상되고 있습니다.',
    fake: '메타버스가 현실을 완전히 대체해 모든 사람이 가상세계에 살게 됩니다.',
  },
  '14': {
    title: '블록체인, 기술 혁신',
    real: '블록체인 기술의 혁신으로 다양한 분야에 적용되고 있습니다.',
    fake: '블록체인이 모든 은행을 대체해 현금이 완전히 사라집니다.',
  },
  '15': {
    title: '교육제도, 개혁 논의',
    real: '교육제도 개혁에 대한 논의가 활발히 진행되고 있습니다.',
    fake: '모든 학교를 폐쇄하고 교육을 금지한다고 발표했습니다.',
  },
};

// 풀이 완료 상태: 제목, 진짜기사, 가짜기사, 사용자선택, 정답유무
const dummySolvedQuizDetail: Record<string, {
  title: string;
  real: string;
  fake: string;
  userAnswer: 'real' | 'fake';
  isCorrect: boolean;
}> = {
  '1': {
    title: '정부, 새로운 정책 발표',
    real: '정부는 오늘 새로운 정책을 공식 발표했습니다. 이번 정책은...',
    fake: '정부는 오늘 모든 세금을 폐지한다고 발표했습니다. 이에 따라...',
    userAnswer: 'fake',
    isCorrect: false,
  },
  '2': {
    title: '주식시장, 사상 최고치 경신',
    real: '오늘 주식시장은 사상 최고치를 기록하며 마감했습니다. 전문가들은...',
    fake: '오늘 주식시장은 모든 종목이 상한가를 기록했습니다. 투자자들은...',
    userAnswer: 'real',
    isCorrect: true,
  },
  '3': {
    title: 'AI, 일자리 대체 논란',
    real: 'AI 기술의 발전으로 일자리 대체에 대한 우려가 커지고 있습니다.',
    fake: 'AI가 모든 직업을 대체해 내일부터 모든 사람이 실직하게 됩니다.',
    userAnswer: 'fake',
    isCorrect: false,
  },
  '4': {
    title: '국회, 예산안 통과',
    real: '국회에서 내년도 예산안이 통과되었습니다. 주요 내용은...',
    fake: '국회에서 모든 예산을 폐지하고 무상복지만 실시한다고 발표했습니다.',
    userAnswer: 'real',
    isCorrect: true,
  },
  '5': {
    title: '금리 인상, 시장 영향',
    real: '중앙은행의 금리 인상 결정으로 시장에 영향이 나타나고 있습니다.',
    fake: '중앙은행이 모든 이자를 폐지하고 무이자 대출을 실시한다고 발표했습니다.',
    userAnswer: 'fake',
    isCorrect: false,
  },
  '6': {
    title: '기후변화, 극한 날씨 증가',
    real: '전 세계적으로 기후변화로 인한 극한 날씨 현상이 증가하고 있습니다.',
    fake: '내일부터 지구가 얼어붙어 모든 생명체가 멸종한다고 발표했습니다.',
    userAnswer: 'real',
    isCorrect: true,
  },
  '7': {
    title: '외교부, 새로운 협정 체결',
    real: '외교부는 새로운 국가와의 협정을 체결했습니다. 협정 내용은...',
    fake: '외교부가 모든 국가와의 외교관계를 단절한다고 발표했습니다.',
    userAnswer: 'fake',
    isCorrect: false,
  },
  '8': {
    title: '부동산 시장, 가격 변동',
    real: '부동산 시장에서 가격 변동이 나타나고 있습니다. 전문가들은...',
    fake: '정부가 모든 부동산을 무상으로 분배한다고 발표했습니다.',
    userAnswer: 'real',
    isCorrect: true,
  },
  '9': {
    title: '한류, 세계적 인기 확산',
    real: '한류 문화가 전 세계적으로 인기를 얻고 있습니다. K팝과 K드라마는...',
    fake: '한국 문화가 전 세계에서 금지되어 모든 한류 콘텐츠가 차단됩니다.',
    userAnswer: 'real',
    isCorrect: true,
  },
  '10': {
    title: '영화제, 새로운 작품 발표',
    real: '국제영화제에서 새로운 작품들이 발표되었습니다. 주요 작품들은...',
    fake: '영화제에서 모든 영화를 폐지하고 연극만 상영한다고 발표했습니다.',
    userAnswer: 'fake',
    isCorrect: false,
  },
  '11': {
    title: '전시회, 현대미술 전시',
    real: '현대미술관에서 새로운 전시회가 열렸습니다. 전시 작품들은...',
    fake: '모든 미술관을 폐쇄하고 그림 그리기를 금지한다고 발표했습니다.',
    userAnswer: 'real',
    isCorrect: true,
  },
  '12': {
    title: '새로운 AI 기술 개발',
    real: '연구진이 새로운 AI 기술을 개발했습니다. 이 기술은...',
    fake: 'AI가 모든 기술을 대체해 인간이 더 이상 발명할 수 없다고 발표했습니다.',
    userAnswer: 'fake',
    isCorrect: false,
  },
  '13': {
    title: '메타버스, 가상현실 발전',
    real: '메타버스 기술이 발전하여 가상현실 경험이 향상되고 있습니다.',
    fake: '메타버스가 현실을 완전히 대체해 모든 사람이 가상세계에 살게 됩니다.',
    userAnswer: 'real',
    isCorrect: true,
  },
  '14': {
    title: '블록체인, 기술 혁신',
    real: '블록체인 기술의 혁신으로 다양한 분야에 적용되고 있습니다.',
    fake: '블록체인이 모든 은행을 대체해 현금이 완전히 사라집니다.',
    userAnswer: 'fake',
    isCorrect: false,
  },
  '15': {
    title: '교육제도, 개혁 논의',
    real: '교육제도 개혁에 대한 논의가 활발히 진행되고 있습니다.',
    fake: '모든 학교를 폐쇄하고 교육을 금지한다고 발표했습니다.',
    userAnswer: 'real',
    isCorrect: true,
  },
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function OxQuizDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = params;
  const [quiz, setQuiz] = useState<typeof dummyQuizDetail['1'] | typeof dummySolvedQuizDetail['1'] | null>(null);
  const [selected, setSelected] = useState<'real' | 'fake' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuizId, setCurrentQuizId] = useState<number | null>(null);
  const [userQuizStatus, setUserQuizStatus] = useState<{ solved: boolean; isCorrect?: boolean; userAnswer?: 'real' | 'fake' } | null>(null);

  useEffect(() => {
    const quizId = id;
    setCurrentQuizId(parseInt(quizId));
    console.log('현재 퀴즈 ID:', quizId);
    
    // 로컬스토리지에서 사용자 퀴즈 상태 확인
    const savedStatus = localStorage.getItem('userOxQuizStatus');
    console.log('저장된 퀴즈 상태:', savedStatus);
    let isSolved = false;
    let solvedData = null;
    
    if (savedStatus) {
      const allUserStatus = JSON.parse(savedStatus);
      console.log('전체 사용자 상태:', allUserStatus);
      const currentStatus = allUserStatus[quizId];
      console.log('현재 퀴즈 상태:', currentStatus);
      if (currentStatus?.solved) {
        isSolved = true;
        setUserQuizStatus(currentStatus);
        console.log('퀴즈가 이미 풀린 상태입니다');
        // 풀이 완료된 경우 서버에서 풀이 결과 포함된 데이터 요청
        // 실제로는 fetch(`/api/oxquiz/detail/${quizId}?solved=true`)로 받아오세요
        solvedData = dummySolvedQuizDetail[quizId];
      }
    }
    
    if (isSolved && solvedData) {
      // 풀이 완료된 데이터 사용
      console.log('풀이 완료된 데이터 사용:', solvedData);
      setQuiz(solvedData);
    } else {
      // 미풀이 데이터 사용
      console.log('미풀이 데이터 사용');
      // 실제로는 fetch(`/api/oxquiz/detail/${quizId}`)로 받아오세요
      const quizData = dummyQuizDetail[quizId];
      if (!quizData) {
        router.push('/oxquiz');
        return;
      }
      setQuiz(quizData);
    }
    
    setLoading(false);
  }, [id, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">로딩 중...</div>;
  }

  if (!quiz) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3]">퀴즈를 찾을 수 없습니다.</div>;
  }

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    const correct = selected === 'real';
    setIsCorrect(correct);
    
    // 실제로는 API로 정답 제출
    // fetch(`/api/oxquiz/submit`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ quizId: currentQuizId, answer: selected })
    // });
    
    // 메인페이지의 퀴즈 상태 업데이트
    if (currentQuizId && (window as any).updateOxQuizStatus) {
      (window as any).updateOxQuizStatus(currentQuizId, correct, selected);
    }
    
    // 자동으로 메인페이지로 돌아가지 않음 - 사용자가 직접 나가도록 함
  };

  // 이미 푼 경우 결과 안내만
  if (userQuizStatus?.solved) {
    const solvedQuiz = quiz as typeof dummySolvedQuizDetail['1'];
    const expGained = solvedQuiz.isCorrect ? 1 : 0;
    const totalExp = 100 + expGained; // 임시 누적 경험치 (실제로는 DB에서 가져와야 함)
    
    return (
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-8 px-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-10">
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
            <div className="text-xl sm:text-2xl font-bold text-[#222] text-center">{solvedQuiz.title}</div>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch justify-center">
            <div
              className={`flex-1 rounded-xl border-2 p-8 cursor-pointer transition-all shadow-sm min-h-[300px] flex flex-col
                ${solvedQuiz.userAnswer === 'real' ? (solvedQuiz.isCorrect ? 'ring-2 ring-green-400 border-[#7f9cf5] bg-[#e6f0ff]' : 'ring-2 ring-red-400 border-[#e0e7ef] bg-[#f7fafd]') : 'border-[#e0e7ef] bg-[#f7fafd]'}
              `}
            >
              <div className="font-semibold text-[#2b6cb0] mb-4 text-lg">뉴스 A</div>
              <div className="text-base text-gray-800 whitespace-pre-line flex-1 leading-relaxed">{solvedQuiz.real}</div>
            </div>
            <div
              className={`flex-1 rounded-xl border-2 p-8 cursor-pointer transition-all shadow-sm min-h-[300px] flex flex-col
                ${solvedQuiz.userAnswer === 'fake' ? (!solvedQuiz.isCorrect ? 'ring-2 ring-green-400 border-[#7f9cf5] bg-[#e6f0ff]' : 'ring-2 ring-red-400 border-[#e0e7ef] bg-[#f7fafd]') : 'border-[#e0e7ef] bg-[#f7fafd]'}
              `}
            >
              <div className="font-semibold text-[#2b6cb0] mb-4 text-lg">뉴스 B</div>
              <div className="text-base text-gray-800 whitespace-pre-line flex-1 leading-relaxed">{solvedQuiz.fake}</div>
            </div>
          </div>
          <div className={`text-center text-lg font-semibold mt-2 ${solvedQuiz.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {solvedQuiz.isCorrect
              ? '정답! 진짜 뉴스(A)를 맞췄어요.'
              : `오답! 진짜 뉴스는 A입니다. (내 답: ${solvedQuiz.userAnswer === 'real' ? 'A' : 'B'})`}
          </div>
          <div className="mt-4 text-center text-gray-500">이미 푼 퀴즈입니다.</div>
          
          {/* 경험치 정보 */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#e6f1fb] rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-xs text-gray-500 mb-1">OX퀴즈 경험치</div>
              <div className="text-xl font-bold text-[#43e6b5]">+{expGained}점</div>
            </div>
            <div className="bg-[#f7fafd] rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-xs text-gray-500 mb-1">나의 누적 경험치</div>
              <div className="text-xl font-bold text-[#7f9cf5]">{totalExp}점</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 아직 안 푼 경우 기존 방식
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] pt-8 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 mb-10">
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
          <div className="text-xl sm:text-2xl font-bold text-[#222] text-center">{quiz.title}</div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch justify-center">
          <div
            onClick={() => !submitted && setSelected('real')}
            className={`flex-1 rounded-xl border-2 p-8 cursor-pointer transition-all shadow-sm min-h-[300px] flex flex-col
              ${selected === 'real' ? 'border-[#7f9cf5] bg-[#e6f0ff]' : 'border-[#e0e7ef] bg-[#f7fafd]'}
              ${submitted && selected === 'real' && isCorrect === true ? 'ring-2 ring-green-400' : ''}
              ${submitted && selected === 'real' && isCorrect === false ? 'ring-2 ring-red-400' : ''}
            `}
          >
            <div className="font-semibold text-[#2b6cb0] mb-4 text-lg">뉴스 A</div>
            <div className="text-base text-gray-800 whitespace-pre-line flex-1 leading-relaxed">{quiz.real}</div>
          </div>
          <div
            onClick={() => !submitted && setSelected('fake')}
            className={`flex-1 rounded-xl border-2 p-8 cursor-pointer transition-all shadow-sm min-h-[300px] flex flex-col
              ${selected === 'fake' ? 'border-[#7f9cf5] bg-[#e6f0ff]' : 'border-[#e0e7ef] bg-[#f7fafd]'}
              ${submitted && selected === 'fake' && isCorrect === false ? 'ring-2 ring-green-400' : ''}
              ${submitted && selected === 'fake' && isCorrect === true ? 'ring-2 ring-red-400' : ''}
            `}
          >
            <div className="font-semibold text-[#2b6cb0] mb-4 text-lg">뉴스 B</div>
            <div className="text-base text-gray-800 whitespace-pre-line flex-1 leading-relaxed">{quiz.fake}</div>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!selected || submitted}
          className={`w-full py-3 rounded-full font-bold text-lg shadow transition
            ${selected && !submitted ? 'bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white hover:opacity-90' : 'bg-[#e6eaf3] text-gray-400 cursor-not-allowed'}`}
        >
          {submitted ? (isCorrect ? '정답입니다!' : '오답입니다!') : '제출'}
        </button>
        {submitted && (
          <div className={`text-center text-lg font-semibold mt-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '정답! 진짜 뉴스(A)를 맞췄어요.' : '오답! 진짜 뉴스는 A입니다.'}
          </div>
        )}
        {submitted && (
          <div className="text-center text-sm text-gray-500 mt-2">
            OX퀴즈목록으로 돌아가서 다른 퀴즈를 풀어보세요!
          </div>
        )}
        
        {/* 제출 후 경험치 정보 표시 */}
        {submitted && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#e6f1fb] rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-xs text-gray-500 mb-1">OX퀴즈 경험치</div>
              <div className="text-xl font-bold text-[#43e6b5]">+{isCorrect ? 1 : 0}점</div>
            </div>
            <div className="bg-[#f7fafd] rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-xs text-gray-500 mb-1">나의 누적 경험치</div>
              <div className="text-xl font-bold text-[#7f9cf5]">{100 + (isCorrect ? 1 : 0)}점</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 