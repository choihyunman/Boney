import React from "react";
import { View, Text, TouchableOpacity, Modal, Dimensions } from "react-native";
import {
  Wallet,
  PiggyBank,
  GraduationCap,
  Briefcase,
  Gift,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react-native";

interface IncomeCategoryProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  backgroundColor: string;
  iconColor: string;
}

interface CategoryIconProps {
  Icon: LucideIcon;
  color: string;
  iconColor: string;
}

const IncomeCategory: React.FC<IncomeCategoryProps> = ({
  visible,
  onClose,
  selectedCategory,
  onSelectCategory,
}) => {
  const categories: Category[] = [
    {
      id: "allowance",
      name: "용돈",
      icon: PiggyBank,
      backgroundColor: "#e2f8ed",
      iconColor: "#4FC985",
    },
    {
      id: "loan",
      name: "대출",
      icon: Wallet,
      backgroundColor: "#dbeafe",
      iconColor: "#3b82f6",
    },
    {
      id: "scholarship",
      name: "장학금",
      icon: GraduationCap,
      backgroundColor: "#fef3c7",
      iconColor: "#f59e0b",
    },
    {
      id: "salary",
      name: "급여",
      icon: Briefcase,
      backgroundColor: "#e0e7ff",
      iconColor: "#6366f1",
    },
    {
      id: "gift",
      name: "선물",
      icon: Gift,
      backgroundColor: "#fce7f3",
      iconColor: "#ec4899",
    },
    {
      id: "etc",
      name: "기타",
      icon: MoreHorizontal,
      backgroundColor: "#f3f4f6",
      iconColor: "#6b7280",
    },
  ];

  const CategoryIcon: React.FC<CategoryIconProps> = ({
    Icon,
    color,
    iconColor,
  }) => (
    <View
      className="w-9 h-9 rounded-full items-center justify-center mb-1.5"
      style={{ backgroundColor: color }}
    >
      <Icon color={iconColor} size={18} />
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
              입금 카테고리 선택
            </Text>
            <TouchableOpacity className="p-1 rounded" onPress={onClose}>
              <Text className="text-base text-gray-500">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap p-3.5 gap-2.5">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className={`w-[${
                  (Dimensions.get("window").width - 68) / 3
                }px] items-center p-2.5 rounded-lg border ${
                  selectedCategory === category.id
                    ? "bg-[rgba(79,201,133,0.1)] border-2 border-[#4FC985]"
                    : "border-gray-200"
                }`}
                onPress={() => onSelectCategory(category.id)}
              >
                <CategoryIcon
                  Icon={category.icon}
                  color={category.backgroundColor}
                  iconColor={category.iconColor}
                />
                <Text className="text-sm font-medium text-gray-700 text-center">
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default IncomeCategory;
