import {
  Home,
  Users,
  BookOpen,
  Heart,
  Settings,
  Edit3,
  Pencil,
} from "lucide-react-native";

export function getQuestIcon(title: string): React.ReactNode {
  switch (title) {
    case "설거지 하기":
    case "심부름 다녀오기":
    case "빨래 개기":
      return <Home size={24} color="#4FC985" />;
    case "가족 식사":
    case "가족 여행":
    case "가족 게임":
      return <Users size={24} color="#4FC985" />;
    case "숙제 완료하기":
    case "독서하기":
    case "시험 준비하기":
      return <BookOpen size={24} color="#4FC985" />;
    case "운동하기":
    case "일찍 자기":
    case "건강한 식사":
      return <Heart size={24} color="#4FC985" />;
    case "기타 활동":
      return <Settings size={24} color="#4FC985" />;
    case "직접 입력":
      return <Edit3 size={24} color="#4FC985" />;
    default:
      return <Pencil size={24} color="#4FC985" />;
  }
}
