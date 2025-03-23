// lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080", // 네 백엔드 주소
  headers: {
    "Content-Type": "application/json",
  },
});
