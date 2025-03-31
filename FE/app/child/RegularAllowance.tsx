import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import GlobalText from "../../components/GlobalText";
import { Calendar, ChevronDown } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";

const DAYS = [
  { id: 1, name: "월요일" },
  { id: 2, name: "화요일" },
  { id: 3, name: "수요일" },
  { id: 4, name: "목요일" },
  { id: 5, name: "금요일" },
  { id: 6, name: "토요일" },
  { id: 0, name: "일요일" },
];

const DATES = Array.from({ length: 31 }, (_, i) => ({
  id: i + 1,
  name: `${i + 1}일`,
}));

export default function RegularAllowance() {
  const params = useLocalSearchParams();
  const childName = params.childName as string;
  const profileImage = params.profileImage as string;

  const [isWeekly, setIsWeekly] = useState(true);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [selectedDate, setSelectedDate] = useState(DATES[0]);
  const [isDayPickerVisible, setIsDayPickerVisible] = useState(false);

  return (
    <View className="flex-1 bg-gray-50 px-4 py-3">
      {/* Card Container */}
      <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
        {/* Profile Circle */}
        <View className="items-center mb-5">
          <View className="w-[68px] h-[68px] rounded-full overflow-hidden">
            <Image
              source={require("../../assets/profile/profile.jpg")}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <GlobalText className="mt-2 text-[16px] font-medium text-[#020817]">
            {childName}
          </GlobalText>
        </View>

        {/* 지급 주기 선택 */}
        <View className="mb-5">
          <GlobalText className="text-sm text-[#020817] mb-2">
            지급 주기
          </GlobalText>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setIsWeekly(true)}
              className={`flex-1 h-10 rounded-lg items-center justify-center ${
                isWeekly ? "bg-[#4FC985]" : "bg-gray-100"
              }`}
            >
              <GlobalText
                className={`text-sm ${
                  isWeekly ? "text-white" : "text-gray-500"
                }`}
              >
                주마다
              </GlobalText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsWeekly(false)}
              className={`flex-1 h-10 rounded-lg items-center justify-center ${
                !isWeekly ? "bg-[#4FC985]" : "bg-gray-100"
              }`}
            >
              <GlobalText
                className={`text-sm ${
                  !isWeekly ? "text-white" : "text-gray-500"
                }`}
              >
                월마다
              </GlobalText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 지급 요일/일 선택 */}
        <View className="mb-5">
          <GlobalText className="text-sm text-[#020817] mb-2">
            {isWeekly ? "지급 요일" : "지급일"}
          </GlobalText>
          <TouchableOpacity
            onPress={() => setIsDayPickerVisible(true)}
            className="h-10 px-3 bg-white rounded-lg border border-gray-200 flex-row items-center justify-between"
          >
            <GlobalText className="text-sm text-[#020817]">
              {isWeekly ? selectedDay.name : selectedDate.name}
            </GlobalText>
            <ChevronDown size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* 용돈 금액 */}
        <View className="mb-2">
          <GlobalText className="text-sm text-[#020817] mb-2">
            용돈 금액
          </GlobalText>
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 h-11 px-3 bg-white rounded-lg border border-gray-200 text-sm"
              placeholder="금액을 입력해주세요"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
            <GlobalText className="ml-2 text-sm text-[#020817]">원</GlobalText>
          </View>
        </View>

        {/* 자동 지급 알림 */}
        <View className="flex-row items-center mb-5">
          <Calendar size={12} color="#9CA3AF" />
          <GlobalText className="ml-2 text-xs text-gray-500">
            {isWeekly
              ? `매주 ${selectedDay.name}에 자동으로 지급됩니다.`
              : `매월 ${selectedDate.name}에 자동으로 지급됩니다.`}
          </GlobalText>
        </View>

        {/* 버튼 */}
        <View>
          <TouchableOpacity className="h-10 bg-[#4FC985] rounded-lg items-center justify-center">
            <GlobalText className="text-sm text-white">
              용돈 설정하기
            </GlobalText>
          </TouchableOpacity>

          <TouchableOpacity className="h-10 mt-2 bg-white border border-red-500 rounded-lg items-center justify-center mb-8">
            <GlobalText className="text-sm text-red-500">해지하기</GlobalText>
          </TouchableOpacity>
        </View>

        {/* 구분선 */}
        <View className="h-[1px] bg-gray-200 mb-5" />

        {/* 참고 사항 */}
        <View>
          {/* 타이틀 */}
          <GlobalText weight="bold" className="text-base text-[#020817] mb-2">
            참고해주세요
          </GlobalText>

          {/* 목록 */}
          {[
            "선택한 날짜가 없는 달엔 말일에 지급돼요.",
            "지급일이 오늘이면 다음 회차부터 지급돼요.",
          ].map((text, index) => (
            <View key={index} className="flex-row items-start mb-1.5">
              <View className="mt-[5px] mr-2 w-1.5 h-1.5 rounded-full bg-[#4FC985]" />
              <GlobalText
                className="text-xs text-gray-600"
                style={{ lineHeight: 20 }}
              >
                {text}
              </GlobalText>
            </View>
          ))}
        </View>
      </View>

      {/* 선택 모달 */}
      <Modal
        visible={isDayPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDayPickerVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setIsDayPickerVisible(false)}
        >
          <View className="w-72 bg-white rounded-xl overflow-hidden">
            <ScrollView>
              {(isWeekly ? DAYS : DATES).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="px-3 py-2.5 border-b border-gray-100"
                  onPress={() => {
                    if (isWeekly) {
                      setSelectedDay(item);
                    } else {
                      setSelectedDate(item);
                    }
                    setIsDayPickerVisible(false);
                  }}
                >
                  <GlobalText
                    className={`text-sm ${
                      (isWeekly ? selectedDay.id : selectedDate.id) === item.id
                        ? "text-[#4FC985]"
                        : "text-[#020817]"
                    }`}
                  >
                    {item.name}
                  </GlobalText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
