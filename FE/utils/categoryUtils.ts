import {
  PiggyBank,
  Wallet,
  Gift,
  Briefcase,
  ArrowRightLeft,
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
  LucideIcon,
} from "lucide-react-native";

interface CategoryIconInfo {
  Icon: LucideIcon;
  backgroundColor: string;
  iconColor: string;
}

export const getCategoryIcon = (categoryName: string): CategoryIconInfo => {
  switch (categoryName) {
    case "입금":
      return {
        Icon: PiggyBank,
        backgroundColor: "bg-[#e2f8ed]",
        iconColor: "#4FC985",
      };
    case "출금":
      return {
        Icon: Wallet,
        backgroundColor: "bg-[#dbeafe]",
        iconColor: "#3b82f6",
      };
    case "용돈":
      return {
        Icon: Gift,
        backgroundColor: "bg-[#fce7f3]",
        iconColor: "#ec4899",
      };
    case "대출":
      return {
        Icon: Wallet,
        backgroundColor: "bg-[#dbeafe]",
        iconColor: "#3b82f6",
      };
    case "퀘스트":
      return {
        Icon: Briefcase,
        backgroundColor: "bg-[#e0e7ff]",
        iconColor: "#6366f1",
      };
    case "이체":
      return {
        Icon: ArrowRightLeft,
        backgroundColor: "bg-[#e0e7ff]",
        iconColor: "#6366f1",
      };
    case "대출상환":
      return {
        Icon: Wallet,
        backgroundColor: "bg-[#dbeafe]",
        iconColor: "#3b82f6",
      };
    case "식사":
      return {
        Icon: Utensils,
        backgroundColor: "bg-[#fef3c7]",
        iconColor: "#f59e0b",
      };
    case "교통비":
      return {
        Icon: Bus,
        backgroundColor: "bg-[#e0e7ff]",
        iconColor: "#6366f1",
      };
    case "학습":
      return {
        Icon: GraduationCap,
        backgroundColor: "bg-[#dbeafe]",
        iconColor: "#3b82f6",
      };
    case "문구":
      return {
        Icon: Pencil,
        backgroundColor: "bg-[#fee2e2]",
        iconColor: "#ef4444",
      };
    case "문화":
      return {
        Icon: Film,
        backgroundColor: "bg-[#fce7f3]",
        iconColor: "#ec4899",
      };
    case "카페/간식":
      return {
        Icon: Coffee,
        backgroundColor: "bg-[#fef3c7]",
        iconColor: "#d97706",
      };
    case "의류/미용":
      return {
        Icon: Shirt,
        backgroundColor: "bg-[#f3e8ff]",
        iconColor: "#a855f7",
      };
    case "의료":
      return {
        Icon: Stethoscope,
        backgroundColor: "bg-[#dcfce7]",
        iconColor: "#22c55e",
      };
    case "생활/잡화":
      return {
        Icon: Home,
        backgroundColor: "bg-[#e0f2fe]",
        iconColor: "#0ea5e9",
      };
    case "기타":
      return {
        Icon: MoreHorizontal,
        backgroundColor: "bg-[#f3f4f6]",
        iconColor: "#6b7280",
      };
    default:
      return {
        Icon: MoreHorizontal,
        backgroundColor: "bg-[#f3f4f6]",
        iconColor: "#6b7280",
      };
  }
};
