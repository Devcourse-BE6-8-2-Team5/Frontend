// API 요청 시 accessToken을 헤더에 추가하는 헬퍼 함수
export const apiRequest = async (
  url: string, 
  options: RequestInit = {}, 
  accessToken?: string | null
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // accessToken이 있으면 Authorization 헤더에 추가
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // 쿠키 포함
  });

  return response;
};
