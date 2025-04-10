import {
  Utensils,
  Bus,
  GraduationCap,
  Pencil,
  Film,
  Coffee,
  Shirt,
  Stethoscope,
  Home,
  MoreHorizontal,
} from "lucide-react-native";

// 배경색 클래스를 스타일 객체로 변환하는 함수
export const getBgStyle = (bgClass: string | undefined) => {
  if (!bgClass) return { backgroundColor: "#ffffff" };

  switch (bgClass) {
    case "bg-[#fef3c7]":
      return { backgroundColor: "#fef3c7" };
    case "bg-[#e0e7ff]":
      return { backgroundColor: "#e0e7ff" };
    case "bg-[#dbeafe]":
      return { backgroundColor: "#dbeafe" };
    case "bg-[#fee2e2]":
      return { backgroundColor: "#fee2e2" };
    case "bg-[#fce7f3]":
      return { backgroundColor: "#fce7f3" };
    case "bg-[#f3e8ff]":
      return { backgroundColor: "#f3e8ff" };
    case "bg-[#dcfce7]":
      return { backgroundColor: "#dcfce7" };
    case "bg-[#e0f2fe]":
      return { backgroundColor: "#e0f2fe" };
    case "bg-[#f3f4f6]":
      return { backgroundColor: "#f3f4f6" };
    case "bg-[#e6f7ee]":
      return { backgroundColor: "#e6f7ee" };
    default:
      return { backgroundColor: "#ffffff" };
  }
};

// 메뉴 카테고리 데이터
export const categories = [
  {
    id: 1,
    name: "식사",
    icon: Utensils,
    backgroundColor: "bg-[#fef3c7]",
    iconColor: "#f59e0b",
  },
  {
    id: 2,
    name: "교통비",
    icon: Bus,
    backgroundColor: "bg-[#e0e7ff]",
    iconColor: "#6366f1",
  },
  {
    id: 3,
    name: "학습",
    icon: GraduationCap,
    backgroundColor: "bg-[#dbeafe]",
    iconColor: "#3b82f6",
  },
  {
    id: 4,
    name: "문구",
    icon: Pencil,
    backgroundColor: "bg-[#fee2e2]",
    iconColor: "#ef4444",
  },
  {
    id: 5,
    name: "문화",
    icon: Film,
    backgroundColor: "bg-[#fce7f3]",
    iconColor: "#ec4899",
  },
  {
    id: 6,
    name: "카페/간식",
    icon: Coffee,
    backgroundColor: "bg-[#fef3c7]",
    iconColor: "#d97706",
  },
  {
    id: 7,
    name: "의류/미용",
    icon: Shirt,
    backgroundColor: "bg-[#f3e8ff]",
    iconColor: "#a855f7",
  },
  {
    id: 8,
    name: "의료",
    icon: Stethoscope,
    backgroundColor: "bg-[#dcfce7]",
    iconColor: "#22c55e",
  },
  {
    id: 9,
    name: "생활/잡화",
    icon: Home,
    backgroundColor: "bg-[#e0f2fe]",
    iconColor: "#0ea5e9",
  },
  {
    id: 10,
    name: "기타",
    icon: MoreHorizontal,
    backgroundColor: "bg-[#f3f4f6]",
    iconColor: "#6b7280",
  },
];

// 메뉴 아이템 데이터
export const menuItems = [
  // 식사
  {
    id: 1,
    name: "학생 도시락",
    price: 7500,
    category: 1,
    rating: 4.8,
  },
  {
    id: 2,
    name: "김치찌개",
    price: 8000,
    category: 1,
    rating: 4.7,
  },
  {
    id: 3,
    name: "제육볶음",
    price: 8500,
    category: 1,
    rating: 4.6,
  },

  // 교통비
  {
    id: 4,
    name: "버스 정기권",
    price: 55000,
    category: 2,
    rating: 4.9,
  },
  {
    id: 5,
    name: "지하철 정기권",
    price: 60000,
    category: 2,
    rating: 4.8,
  },
  {
    id: 6,
    name: "택시 이용권",
    price: 10000,
    category: 2,
    rating: 4.5,
  },

  // 학습
  {
    id: 7,
    name: "수학 문제집",
    price: 15000,
    category: 3,
    rating: 4.7,
  },
  {
    id: 8,
    name: "영어 단어장",
    price: 12000,
    category: 3,
    rating: 4.6,
  },
  {
    id: 9,
    name: "온라인 강의",
    price: 50000,
    category: 3,
    rating: 4.9,
  },

  // 문구
  {
    id: 10,
    name: "필통 세트",
    price: 8500,
    category: 4,
    rating: 4.5,
  },
  {
    id: 11,
    name: "노트 3종 세트",
    price: 6000,
    category: 4,
    rating: 4.4,
  },
  {
    id: 12,
    name: "형광펜 세트",
    price: 4500,
    category: 4,
    rating: 4.3,
  },

  // 문화
  {
    id: 13,
    name: "영화 티켓",
    price: 12000,
    category: 5,
    rating: 4.8,
  },
  {
    id: 14,
    name: "전시회 입장권",
    price: 15000,
    category: 5,
    rating: 4.7,
  },
  {
    id: 15,
    name: "콘서트 티켓",
    price: 55000,
    category: 5,
    rating: 4.9,
  },

  // 카페/간식
  {
    id: 16,
    name: "아메리카노",
    price: 4500,
    category: 6,
    rating: 4.6,
  },
  {
    id: 17,
    name: "카페 라떼",
    price: 5000,
    category: 6,
    rating: 4.5,
  },
  {
    id: 18,
    name: "크로플",
    price: 5500,
    category: 6,
    rating: 4.7,
  },

  // 의류/미용
  {
    id: 19,
    name: "기본 티셔츠",
    price: 15000,
    category: 7,
    rating: 4.4,
  },
  {
    id: 20,
    name: "헤어 케어 세트",
    price: 25000,
    category: 7,
    rating: 4.6,
  },
  {
    id: 21,
    name: "스킨케어 세트",
    price: 35000,
    category: 7,
    rating: 4.8,
  },

  // 의료
  {
    id: 22,
    name: "종합 감기약",
    price: 8000,
    category: 8,
    rating: 4.7,
  },
  {
    id: 23,
    name: "비타민 세트",
    price: 25000,
    category: 8,
    rating: 4.8,
  },
  {
    id: 24,
    name: "마스크 (50매)",
    price: 12000,
    category: 8,
    rating: 4.6,
  },

  // 생활/잡화
  {
    id: 25,
    name: "휴대용 선풍기",
    price: 15000,
    category: 9,
    rating: 4.5,
  },
  {
    id: 26,
    name: "미니 가습기",
    price: 22000,
    category: 9,
    rating: 4.6,
  },
  {
    id: 27,
    name: "멀티 충전기",
    price: 18000,
    category: 9,
    rating: 4.7,
  },

  // 기타
  {
    id: 28,
    name: "기프트 카드",
    price: 10000,
    category: 10,
    rating: 4.9,
  },
  {
    id: 29,
    name: "모바일 상품권",
    price: 30000,
    category: 10,
    rating: 4.8,
  },
  {
    id: 30,
    name: "기부 포인트",
    price: 5000,
    category: 10,
    rating: 5.0,
  },
];
