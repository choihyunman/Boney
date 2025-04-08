import {
  BookOpen,
  Heart,
  Settings,
  Edit3,
  Pencil,
  ShoppingBag,
  Shirt,
  Utensils,
  Plane,
  Gamepad2,
  Brain,
  Clock,
  Apple,
  NotebookPen,
} from "lucide-react-native";

export function getQuestIcon(title: string): React.ReactNode {
  switch (title) {
    case "설거지 하기":
      return <Utensils size={24} color="#4FC985" />;
    case "심부름 다녀오기":
      return <ShoppingBag size={24} color="#4FC985" />;
    case "빨래 개기":
      return <Shirt size={24} color="#4FC985" />;
    case "가족 식사":
      return <Utensils size={24} color="#4FC985" />;
    case "가족 여행":
      return <Plane size={24} color="#4FC985" />;
    case "가족 게임":
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
