import {
  BookOpen,
  Heart,
  Settings,
  Edit3,
  Pencil,
  ShoppingBag,
  Shirt,
  Utensils,
  Gamepad2,
  Brain,
  Clock,
  Apple,
  NotebookPen,
  Sparkles,
  CookingPot,
} from "lucide-react-native";

export function getQuestIcon(title: string): React.ReactNode {
  switch (title) {
    case "설거지 하기":
      return <Sparkles size={24} color="#4FC985" />;
    case "심부름 다녀오기":
      return <ShoppingBag size={24} color="#4FC985" />;
    case "빨래 개기":
      return <Shirt size={24} color="#4FC985" />;
    case "가족 식사하기":
      return <Utensils size={24} color="#4FC985" />;
    case "요리해주기":
      return <CookingPot size={24} color="#4FC985" />;
    case "함께 시간 보내기":
      return <Gamepad2 size={24} color="#4FC985" />;
    case "숙제 완료하기":
      return <NotebookPen size={24} color="#4FC985" />;
    case "시험 준비하기":
      return <Brain size={24} color="#4FC985" />;
    case "독서하기":
      return <BookOpen size={24} color="#4FC985" />;
    case "운동하기":
      return <Heart size={24} color="#4FC985" />;
    case "일찍 자기":
      return <Clock size={24} color="#4FC985" />;
    case "건강한 식사":
      return <Apple size={24} color="#4FC985" />;
    case "기타 활동":
      return <Settings size={24} color="#4FC985" />;
    case "직접 입력":
      return <Edit3 size={24} color="#4FC985" />;
    default:
      return <Pencil size={24} color="#4FC985" />;
  }
}
