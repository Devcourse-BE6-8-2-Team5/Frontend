import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] font-sans">
      {/* 로고/서비스명 */}
      <div className="mb-8 text-center">
        <span className="text-3xl font-extrabold text-[#2b6cb0] tracking-tight">뉴스OX</span>
        <div className="text-base text-gray-500 mt-2">진짜 뉴스를 가려내는 AI 퀴즈 서비스</div>
      </div>
      {/* 회원가입 폼 */}
      <form className="bg-white rounded-2xl shadow-lg px-8 py-8 w-full max-w-md flex flex-col gap-4">
        <input type="email" placeholder="이메일" className="rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7f9cf5]" />
        <input type="password" placeholder="비밀번호" className="rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7f9cf5]" />
        <input type="password" placeholder="비밀번호 확인" className="rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7f9cf5]" />
        <input type="text" placeholder="이름" className="rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7f9cf5]" />
        <button type="submit" className="mt-2 bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white font-semibold py-2 rounded-full shadow hover:opacity-90 transition">회원가입</button>
        <Link href="/login" className="mt-2 text-center text-[#2b6cb0] font-semibold hover:underline">이미 계정이 있으신가요? 로그인</Link>
      </form>
    </div>
  );
} 