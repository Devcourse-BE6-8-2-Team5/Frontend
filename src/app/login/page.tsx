import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] font-sans">
      {/* 로고/서비스명 */}
      <div className="mb-8 text-center">
        <span className="text-3xl font-extrabold text-[#2b6cb0] tracking-tight">뉴스OX</span>
        <div className="text-base text-gray-500 mt-2">진짜 뉴스를 가려내는 AI 퀴즈 서비스</div>
      </div>
      {/* 로그인 폼 */}
      <form className="bg-white rounded-2xl shadow-lg px-8 py-8 w-full max-w-md flex flex-col gap-4">
        <input type="email" placeholder="이메일" className="rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7f9cf5]" />
        <input type="password" placeholder="비밀번호" className="rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7f9cf5]" />
        <button type="submit" className="w-full flex items-center gap-3 justify-center h-10 text-base font-medium rounded-full shadow bg-gradient-to-r from-[#7f9cf5] to-[#43e6b5] text-white hover:opacity-90 transition">로그인</button>
        <div className="flex items-center my-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-2 text-gray-400 text-sm">또는</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        {/* 네이버 소셜로그인 */}
        <button type="button" className="group w-full flex items-center gap-3 justify-center h-10 text-base font-medium rounded-full shadow bg-[#03C75A] text-white hover:opacity-90 transition mb-1">
          <Image src="/social/naver_login.png" alt="네이버 로고" width={24} height={24} className="group-hover:opacity-80 transition" />
          <span>네이버로 로그인</span>
        </button>
        {/* 구글 소셜로그인 */}
        <button type="button" className="group w-full flex items-center gap-3 justify-center h-10 text-base font-medium rounded-full shadow bg-[#FFFFFF] border border-gray-300 text-[#3c4043] hover:bg-gray-50 transition mb-1">
          <Image src="/social/google_login.png" alt="구글 로고" width={24} height={24} className="ml-[-13px] group-hover:opacity-80 transition" />
          <span>구글로 로그인</span>
        </button>
        {/* 카카오 소셜로그인 */}
        <button type="button" className="group w-full flex items-center gap-3 justify-center h-10 text-base font-medium rounded-full shadow bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FFEB3B] transition mb-1">
          <Image src="/social/kakao_login.png" alt="카카오 로고" width={24} height={24} className="group-hover:opacity-70 transition" />
          <span>카카오로 로그인</span>
        </button>
        <Link href="/register" className="mt-4 text-center text-[#2b6cb0] font-semibold hover:underline">회원가입하기</Link>
      </form>
    </div>
  );
} 