import React from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import {
  Wallet,
  Utensils,
  Bus,
  GraduationCap,
  Pencil,
  Film,
  Coffee,
  Shirt,
  Stethoscope,
  Home,
  ArrowRightLeft,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react-native";

interface ExpenseCategoryProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

interface Category {
  id: string;
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

const ExpenseCategoryModal: React.FC<ExpenseCategoryProps> = ({
  visible,
  onClose,
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = [
    {
      id: "repayment",
      name: "대출상환",
      icon: Wallet,
      color: "#dbeafe",
      iconColor: "#3b82f6",
    },
    {
      id: "food",
      name: "식사",
      icon: Utensils,
      color: "#fef3c7",
      iconColor: "#f59e0b",
    },
    {
      id: "transport",
      name: "교통비",
      icon: Bus,
      color: "#e0e7ff",
      iconColor: "#6366f1",
    },
    {
      id: "education",
      name: "학습",
      icon: GraduationCap,
      color: "#dbeafe",
      iconColor: "#3b82f6",
    },
    {
      id: "stationery",
      name: "문구",
      icon: Pencil,
      color: "#fee2e2",
      iconColor: "#ef4444",
    },
    {
      id: "culture",
      name: "문화",
      icon: Film,
      color: "#fce7f3",
      iconColor: "#ec4899",
    },
    {
      id: "cafe",
      name: "카페/간식",
      icon: Coffee,
      color: "#fef3c7",
      iconColor: "#d97706",
    },
    {
      id: "fashion",
      name: "의류/미용",
      icon: Shirt,
      color: "#f3e8ff",
      iconColor: "#a855f7",
    },
    {
      id: "medical",
      name: "의료",
      icon: Stethoscope,
      color: "#dcfce7",
      iconColor: "#22c55e",
    },
    {
      id: "living",
      name: "생활",
      icon: Home,
      color: "#e0f2fe",
      iconColor: "#0ea5e9",
    },
    {
      id: "transfer",
      name: "이체",
      icon: ArrowRightLeft,
      color: "#e0e7ff",
      iconColor: "#6366f1",
    },
    {
      id: "etc",
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
      className="w-8 h-8 rounded-full items-center justify-center mb-1.5"
      style={{ backgroundColor: color }}
    >
      <Icon color={iconColor} />
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
        <View className="bg-white rounded-lg w-full max-w-[360px] overflow-hidden shadow-lg">
          <View className="p-3.5 border-b border-gray-200 flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-gray-900">
              출금 카테고리 선택
            </Text>
            <TouchableOpacity className="p-1" onPress={onClose}>
              <Text className="text-base text-gray-500">✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View className="flex-row flex-wrap p-3.5">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className={`w-1/3 p-1.5 items-center ${
                    selectedCategory === category.id
                      ? "bg-primary/10 border-2 border-primary rounded-lg"
                      : ""
                  }`}
                  onPress={() => onSelectCategory(category.id)}
                >
                  <CategoryIcon
                    Icon={category.icon}
                    color={category.color}
                    iconColor={category.iconColor}
                  />
                  <Text className="text-xs font-medium text-gray-700 text-center">
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ExpenseCategoryModal;
