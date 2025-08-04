"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";



interface NewsArticle {
  id: number;
  title: string;
  content: string;
  description: string;
  link: string;
  imgUrl?: string;
  originCreatedDate: string;
  mediaName: string;
  journalist: string;
  originalNewsUrl: string;
  newsCategory: string;
}

interface NewsPage {
  content: NewsArticle[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

interface TodayNews {
  id: number;
  title: string;
  content: string;
  description: string;
  link: string;
  imgUrl: string;
  originCreatedDate: string;
  mediaName: string;
  journalist: string;
  originalNewsUrl: string;
  newsCategory: string;
}

interface RankingMember {
  id: number;
  name: string;
  exp: number;
  level: number;
  characterImage: string;
  rank: number;
}

export default function Home() {
  const searchParams = useSearchParams();

  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [rankingMembers, setRankingMembers] = useState<RankingMember[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [todayNews, setTodayNews] = useState<TodayNews | null>(null);
  const [todayNewsLoading, setTodayNewsLoading] = useState(true);
  const { checkAuth } = useAuth();

  useEffect(() => {
    const loginSuccess = searchParams.get('loginSuccess');
    const message = searchParams.get('message');


    const redirect = searchParams.get('redirect');

    if (loginSuccess === 'true' && message) {
      alert(message); // 카카오 로그인 성공 메시지 팝업
      // 소셜로그인 성공 후 최신 사용자 정보 가져오기
      checkAuth();

      // 리다이렉트 파라미터가 있으면 해당 페이지로 이동
      if (redirect) {
        console.log('소셜 로그인 성공 후 리다이렉트:', redirect);
        window.location.href = redirect;
      }
    }
  }, [searchParams, checkAuth]);



  // 뉴스 기사 목록 불러오기
  useEffect(() => {
    const fetchNewsArticles = async () => {
      setNewsLoading(true);
      try {
        let url = '';

        if (searchQuery) {
          // 검색어가 있는 경우
          url = `/api/news/search?query=${encodeURIComponent(searchQuery)}&page=${currentPage}&size=9&direction=desc`;
        } else if (selectedCategory) {
          // 카테고리가 선택된 경우 - 한글을 영어로 변환
          const categoryMap: { [key: string]: string } = {
            '정치': 'POLITICS',
            '경제': 'ECONOMY',
            'IT': 'IT',
            '문화': 'CULTURE',
            '사회': 'SOCIETY'
          };
          const englishCategory = categoryMap[selectedCategory] || selectedCategory;
          url = `/api/news/category/${encodeURIComponent(englishCategory)}?page=${currentPage}&size=9&direction=desc`;
        } else {
          // 전체 뉴스
          url = `/api/news?page=${currentPage}&size=9&direction=desc`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.code === 200 && data.data) {
            setNewsArticles(data.data.content || []);
            setTotalPages(data.data.totalPages || 0);
          } else {
            // API 응답이 성공이지만 데이터가 없는 경우
            setNewsArticles([]);
            setTotalPages(0);
          }
        } else {
          // API 호출 실패 시
          setNewsArticles([]);
          setTotalPages(0);
        }
      } catch (error) {
        console.error('뉴스 목록 조회 실패:', error);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNewsArticles();
  }, [currentPage, searchQuery, selectedCategory]);

  // 랭킹 데이터 불러오기
  useEffect(() => {
    const fetchRanking = async () => {
      setRankingLoading(true);
      try {
        const res = await fetch('/api/members/rank');
        if (res.ok) {
          const data = await res.json();
          if (data.code === 200 && data.data) {
            const rankingData = data.data.map((member: any, index: number) => ({
              ...member,
              rank: index + 1
            }));
            setRankingMembers(rankingData);
          }
        }
      } catch (error) {
        console.error('랭킹 데이터 조회 실패:', error);
      } finally {
        setRankingLoading(false);
      }
    };
    fetchRanking();
  }, []);

  // 오늘의 뉴스 불러오기
  useEffect(() => {
    const fetchTodayNews = async () => {
      setTodayNewsLoading(true);
      try {
        const response = await fetch('/api/news/today');
        const data = await response.json();

        if (response.ok && data.code === 200 && data.data) {
          setTodayNews(data.data);
        } else {
          setTodayNews(null);
        }
      } catch (err) {
        console.error('오늘의 뉴스 조회 실패:', err);
        setTodayNews(null);
      } finally {
        setTodayNewsLoading(false);
      }
    };

    fetchTodayNews();
  }, []);

  return (
      <div className="font-sans min-h-screen bg-gradient-to-b from-[#f7fafd] to-[#e6eaf3] flex flex-col items-center relative">
        {/* 상단 네비게이션은 layout.tsx에서 공통 처리됨 */}

        {/* 상단 카드 영역 */}
        <div className="flex flex-col items-center w-full gap-10 mt-2 pt-20">
          <div className="flex flex-row gap-8 w-full max-w-6xl justify-center relative">
            {/* 오늘의 뉴스 카드 */}
            <Link href="/todaynews" className="flex-1 min-w-[260px] max-w-[400px] h-[180px] rounded-3xl bg-gradient-to-b from-[#bfe0f5] via-[#8fa4c3] via-70% to-[#e6f1fb] shadow-lg hover:scale-105 transition-transform cursor-pointer overflow-hidden relative">
              {todayNewsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-white text-lg">로딩 중...</div>
                  </div>
              ) : todayNews ? (
                  <div className="relative h-full">
                    {/* 배경 이미지 */}
                    {todayNews.imgUrl && (
                        <div className="absolute inset-0">
                          <Image
                              src={todayNews.imgUrl}
                              alt={todayNews.title}
                              fill
                              className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40"></div>
                        </div>
                    )}

                    {/* 오버레이 텍스트 */}
                    <div className="relative z-10 h-full flex flex-col justify-end p-4">
                      <div className="text-white">
                        <div className="text-xs font-semibold mb-1 bg-[#7f9cf5]/80 px-2 py-1 rounded-full inline-block">
                          오늘의 뉴스
                        </div>
                        <h3 className="text-sm font-bold leading-tight overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {todayNews.title}
                        </h3>
                      </div>
                    </div>
                  </div>
              ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">오늘의 뉴스</span>
                  </div>
              )}
            </Link>
            {/* OX 퀴즈 카드 */}
            <Link href="/oxquiz" className="flex-1 min-w-[260px] max-w-[400px] h-[180px] rounded-3xl bg-gradient-to-b from-[#bfe0f5] via-[#8fa4c3] via-70% to-[#e6f1fb] flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <span className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">OX 퀴즈</span>
            </Link>

            {/* 랭킹 컴포넌트 - OX 퀴즈 카드 옆에 배치 */}
            <div className="hidden lg:block w-64">
              <div className="bg-white/95 rounded-2xl shadow-lg p-4 border border-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-[#2b6cb0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <h3 className="text-lg font-bold text-[#2b6cb0]">🏆 랭킹</h3>
                </div>

                {rankingLoading ? (
                    <div className="text-sm text-gray-500 text-center py-4">랭킹 로딩 중...</div>
                ) : rankingMembers.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-4">랭킹 데이터가 없습니다.</div>
                ) : (
                    <div className="space-y-2">
                      {rankingMembers.slice(0, 3).map((member, index) => (
                          <div key={member.id || `ranking-${index}`} className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-[#f8fafc] to-[#e6f1fb] border border-[#e0e7ef]/50">
                            {/* 순위 */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                member.rank === 1 ? 'bg-yellow-400 text-white' :
                                    member.rank === 2 ? 'bg-gray-300 text-white' :
                                        member.rank === 3 ? 'bg-orange-400 text-white' :
                                            'bg-[#7f9cf5] text-white'
                            }`}>
                              {member.rank}
                            </div>

                            {/* 캐릭터 이미지 */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7f9cf5] to-[#43e6b5] flex items-center justify-center">
                              <span className="text-sm">{member.characterImage}</span>
                            </div>

                            {/* 사용자 정보 */}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-[#2b6cb0] truncate">{member.name}</div>
                              <div className="text-xs text-[#64748b]">Lv.{member.level} • {member.exp}EXP</div>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </div>
            </div>
          </div>
          {/* 카테고리 버튼 */}
          <div className="flex flex-row gap-4 w-full max-w-2xl justify-center mt-14">
            {['정치', '문화', 'IT', '경제', '사회'].map((cat) => (
                <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === cat ? '' : cat);
                      setCurrentPage(1); // 카테고리 변경 시 첫 페이지로
                      setSearchQuery(''); // 검색어 초기화
                    }}
                    className={`px-7 py-2 rounded-full text-base font-semibold shadow transition-colors ${
                        selectedCategory === cat
                            ? 'bg-[#7f9cf5] text-white border border-[#7f9cf5]'
                            : 'bg-white/80 text-[#383838] border border-[#e0e7ef] hover:bg-[#e0f7fa] hover:text-[#2b6cb0]'
                    }`}
                >
                  {cat}
                </button>
            ))}
          </div>
          {/* 검색창 */}
          <div className="flex items-center w-full max-w-xl mt-1">
            <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
            </span>
              <input
                  type="text"
                  placeholder="뉴스, 키워드 검색"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedCategory(''); // 검색 시 카테고리 선택 해제
                    setCurrentPage(1); // 검색 시 첫 페이지로
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7f9cf5] text-base bg-white shadow"
              />
            </div>
          </div>
        </div>

        {/* 뉴스 기사 목록 */}
        <div className="w-full max-w-6xl px-4 mt-16">
          <h2 className="text-2xl font-bold text-[#2b6cb0] mb-8 text-center">
            {selectedCategory ? `${selectedCategory} 뉴스` : searchQuery ? `"${searchQuery}" 검색 결과` : '최신 뉴스'}
          </h2>

          {newsLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-lg text-gray-500">뉴스를 불러오는 중...</div>
              </div>
          ) : newsArticles.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="text-lg text-gray-500 mb-2">
                    {selectedCategory ? `${selectedCategory} 카테고리의 뉴스가 없습니다.` :
                        searchQuery ? `"${searchQuery}" 검색 결과가 없습니다.` :
                            '표시할 뉴스가 없습니다.'}
                  </div>
                  <div className="text-sm text-gray-400">
                    다른 카테고리를 선택하거나 검색어를 변경해보세요.
                  </div>
                </div>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {newsArticles.map((article, index) => (
                    <Link
                        key={article.id || `article-${index}`}
                        href={`/news/${article.id}`}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group"
                    >
                      {/* 뉴스 이미지 */}
                      {article.imgUrl && (
                          <div className="relative h-48 overflow-hidden">
                            <Image
                                src={article.imgUrl}
                                alt={article.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                      )}

                      {/* 뉴스 내용 */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-[#e6f1fb] text-[#2b6cb0] text-xs font-semibold rounded-full">
                      {article.newsCategory}
                    </span>
                          <span className="text-sm text-gray-500">{article.mediaName}</span>
                        </div>

                        <h3 className="text-lg font-bold text-[#2b6cb0] mb-2 group-hover:text-[#5a7bd8] transition-colors overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {article.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {article.description || article.content.substring(0, 100)}...
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{article.journalist}</span>
                          <span>{new Date(article.originCreatedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Link>
                ))}
              </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-[#7f9cf5] text-white font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#5a7bd8] transition-colors"
                >
                  이전
                </button>

                <span className="px-4 py-2 text-[#2b6cb0] font-semibold">
              {currentPage} / {totalPages}
            </span>

                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-[#7f9cf5] text-white font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#5a7bd8] transition-colors"
                >
                  다음
                </button>
              </div>
          )}
        </div>
      </div>
  );
}
