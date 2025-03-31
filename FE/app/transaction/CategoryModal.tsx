import React from "react";
import { View, TouchableOpacity, Modal, ScrollView } from "react-native";
import {
  Wallet,
  PiggyBank,
  GraduationCap,
  Briefcase,
  Gift,
  MoreHorizontal,
  LucideIcon,
  Utensils,
  Bus,
  Pencil,
  Film,
  Coffee,
  Shirt,
  Stethoscope,
  Home,
  ArrowRightLeft,
} from "lucide-react-native";
import GlobalText from "@/components/GlobalText";

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: number;
  onSelectCategory: (categoryId: number, categoryName: string) => void;
}

interface Category {
  id: number;
  name: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
}

interface CategoryIconProps {
  Icon: LucideIcon;
  color: string;
  iconColor: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  onClose,
  selectedCategory,
  onSelectCategory,
}) => {
  const categories: Category[] = [
    {
      id: 1,
      name: "입금",
      icon: PiggyBank,
      color: "#e2f8ed",
      iconColor: "#4FC985",
    },
    {
      id: 2,
      name: "출금",
      icon: Wallet,
      color: "#dbeafe",
      iconColor: "#3b82f6",
    },
    {
      id: 3,
      name: "용돈",
      icon: Gift,
      color: "#fce7f3",
      iconColor: "#ec4899",
    },
    {
      id: 4,
      name: "대출",
      icon: Wallet,
      color: "#dbeafe",
      iconColor: "#3b82f6",
    },
    {
      id: 5,
      name: "퀘스트",
      icon: Briefcase,
      color: "#e0e7ff",
      iconColor: "#6366f1",
    },
    {
      id: 6,
      name: "이체",
      icon: ArrowRightLeft,
      color: "#e0e7ff",
      iconColor: "#6366f1",
    },
    {
      id: 7,
      name: "대출상환",
      icon: Wallet,
      color: "#dbeafe",
      iconColor: "#3b82f6",
    },
    {
      id: 8,
      name: "식사",
      icon: Utensils,
      color: "#fef3c7",
      iconColor: "#f59e0b",
    },
    {
      id: 9,
      name: "교통비",
      icon: Bus,
      color: "#e0e7ff",
      iconColor: "#6366f1",
    },
    {
      id: 10,
      name: "학습",
      icon: GraduationCap,
      color: "#dbeafe",
      iconColor: "#3b82f6",
    },
    {
      id: 11,
      name: "문구",
      icon: Pencil,
      color: "#fee2e2",
      iconColor: "#ef4444",
    },
    {
      id: 12,
      name: "문화",
      icon: Film,
      color: "#fce7f3",
      iconColor: "#ec4899",
    },
    {
      id: 13,
      name: "카페/간식",
      icon: Coffee,
      color: "#fef3c7",
      iconColor: "#d97706",
    },
    {
      id: 14,
      name: "의류/미용",
      icon: Shirt,
      color: "#f3e8ff",
      iconColor: "#a855f7",
    },
    {
      id: 15,
      name: "의료",
      icon: Stethoscope,
      color: "#dcfce7",
      iconColor: "#22c55e",
    },
    {
      id: 16,
      name: "생활/잡화",
      icon: Home,
      color: "#e0f2fe",
      iconColor: "#0ea5e9",
    },
    {
      id: 17,
      name: "기타",
      icon: MoreHorizontal,
      color: "#f3f4f6",
      iconColor: "#6b7280",
    },
  ];

  const CategoryIcon: React.FC<CategoryIconProps> = ({
    Icon,
    color,
    iconColor,
  }) => (
    <View
      className="w-10 h-10 rounded-full items-center justify-center mb-1"
      style={{ backgroundColor: color }}
    >
      <Icon color={iconColor} size={20} />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="bg-white rounded-lg w-full max-w-[400px] overflow-hidden shadow-lg">
          <View className="p-3 border-b border-gray-200 flex-row justify-between items-center">
            <GlobalText className="text-lg font-semibold text-gray-900">
              카테고리 선택
            </GlobalText>
            <TouchableOpacity className="p-2" onPress={onClose}>
              <GlobalText className="text-lg text-gray-500">✕</GlobalText>
            </TouchableOpacity>
          </View>
          <ScrollView className="max-h-[70vh]">
            <View className="flex-row flex-wrap p-3 gap-2">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className={`w-[31%] p-2 items-center rounded-lg border ${
                    selectedCategory === category.id
                      ? "bg-primary/10 border-primary"
                      : "bg-white border-gray-200"
                  }`}
                  onPress={() => onSelectCategory(category.id, category.name)}
                >
                  <CategoryIcon
                    Icon={category.icon}
                    color={category.color}
                    iconColor={category.iconColor}
                  />
                  <GlobalText className="text-sm font-medium text-gray-700 text-center mt-1">
                    {category.name}
                  </GlobalText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CategoryModal;
