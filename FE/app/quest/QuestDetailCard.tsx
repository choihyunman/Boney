import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Home, BookOpen, Users, Heart, Camera, X } from "lucide-react-native";
import GlobalText from "../../components/GlobalText";

type DetailItem = {
  label: string;
  value: string | React.ReactNode;
  color?: string;
};

type ActionButton = {
  text: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

type QuestDetailCardProps = {
  title: string;
  category: string;
  dueDate: string;
  icon: React.ReactNode;
  details: DetailItem[];
  imageUri?: string | null;
  editableImage?: boolean;
  showCameraButton?: boolean;
  onImageSelect?: () => void;
  onRemoveImage?: () => void;
  extraNote?: string;
  buttons?: ActionButton[];
};

export default function QuestDetailCard({
  title,
  category,
  dueDate,
  icon,
  details,
  buttons,
  extraNote,
  imageUri,
  editableImage = false,
  onImageSelect,
  onRemoveImage,
}: QuestDetailCardProps) {
  const calculateDday = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    if (diffDays === 0) return "D-Day";
    return `D-${diffDays}`;
  };
  const dday = calculateDday(dueDate);

  return (
    <View className="space-y-4 px-6">
      {/* 흰색 카드 본체 */}
      <View className="bg-white rounded-2xl shadow-md p-6 space-y-6">
        <View className="items-center">
          {/* 대표 이미지 or 아이콘 */}
          <View className="relative mb-4">
            <View className="h-48 w-48 rounded-lg bg-[#e6f7ef] items-center justify-center overflow-hidden">
              {imageUri ? (
                <>
                  <Image
                    source={{ uri: imageUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {editableImage && (
                    <TouchableOpacity
                      onPress={onRemoveImage}
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 rounded-full p-1"
                    >
                      <X size={20} color="white" />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                icon
              )}
            </View>
            {editableImage && (
              <TouchableOpacity
                onPress={onImageSelect}
                className="absolute bottom-2 right-2 bg-[#4FC985] rounded-full p-2 shadow-md"
              >
                <Camera size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {/* D-Day 뱃지 */}
          <View
            className={`px-2 py-1 rounded-full mb-2 ${
              dday.includes("+")
                ? "bg-red-100"
                : dday === "D-Day"
                ? "bg-yellow-100"
                : "bg-[#e6f7ef]"
            }`}
          >
            <GlobalText
              className={`text-sm font-medium ${
                dday.includes("+")
                  ? "text-red-600"
                  : dday === "D-Day"
                  ? "text-yellow-600"
                  : "text-[#4FC985]"
              }`}
            >
              {dday}
            </GlobalText>
          </View>

          <GlobalText weight="bold" className="text-2xl text-gray-800 mb-2">
            {title}
          </GlobalText>
          <GlobalText weight="bold" className="text-gray-500">
            {category}
          </GlobalText>
        </View>

        {/* 세부 정보 */}
        <View className="space-y-4 mt-16 px-2">
          {details.map((item, idx) => (
            <View
              key={idx}
              className={`flex-row justify-between items-center mb-4 ${
                idx !== details.length - 1
                  ? "border-b border-gray-100 pb-3"
                  : ""
              }`}
            >
              <GlobalText className="text-md text-gray-600">
                {item.label}
              </GlobalText>
              <GlobalText
                weight="bold"
                className={`text-lg text-right ${
                  item.color ?? "text-gray-800"
                }`}
              >
                {item.value}
              </GlobalText>
            </View>
          ))}
        </View>
        {/* 부연 설명 카드 */}
        {extraNote && (
          <View className="bg-gray-100 rounded-lg p-4 mt-2">
            <GlobalText
              className="text-md text-gray-600 leanding"
              style={{ lineHeight: 18 }}
            >
              {extraNote}
            </GlobalText>
          </View>
        )}
      </View>

      {/* 버튼들 */}
      {buttons && buttons.length > 0 && (
        <View
          className={`flex-row ${
            buttons.length === 1 ? "justify-center" : "space-x-3"
          } pt-1`}
        >
          {buttons.map((btn, idx) => {
            // 1. variant 우선순위 → props로 넘겨준 값 → 자동 지정
            let variant = btn.variant;
            if (!variant && buttons.length === 2) {
              variant = idx === 0 ? "secondary" : "primary";
            } else if (!variant) {
              variant = "primary"; // 기본
            }

            const isPrimary = variant === "primary";

            const flexClass =
              buttons.length === 2
                ? idx === 0
                  ? "flex-1 mr-2"
                  : "flex-[1.5]"
                : "flex-1";

            return (
              <TouchableOpacity
                key={idx}
                onPress={btn.onPress}
                className={`flex-1 py-4 rounded-lg shadow-md mr-1 mt-4 ${flexClass} ${
                  isPrimary ? "bg-[#4FC985]" : "bg-gray-200"
                }`}
              >
                <GlobalText
                  className={`text-center font-medium ${
                    isPrimary ? "text-white" : "text-gray-700"
                  }`}
                >
                  {btn.text}
                </GlobalText>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
