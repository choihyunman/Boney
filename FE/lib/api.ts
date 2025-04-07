// lib/api.ts
import { getToken } from "@/lib/token";
import axios from "axios";

// ✅ 토큰이 필요 없는 URL들
const noAuthRequiredUrls = [
  "/auth/login/kakao/token",
  "/auth/login/kakao/user",
  "/auth/login/kakao/jwt",
  "/auth/signup",
];

export const api = axios.create({
  baseURL: "https://j12b208.p.ssafy.io/api/v1", // 서버 주소
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 요청 인터셉터 등록
api.interceptors.request.use(async (config) => {
  const url = config.url || "";
  // 인증 제외 URL이면 토큰 붙이지 않음
  const isPublic = noAuthRequiredUrls.some((publicUrl) =>
    url.includes(publicUrl)
  );

  if (isPublic) {
    return config;
  }

  // 토큰 동적으로 불러오기
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!isPublic && token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (!isPublic && !token) {
    // console.warn("❗️인증 토큰이 없습니다.");
  }

  return config;
});
