import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import GlobalText from "./GlobalText";
dayjs.locale("ko");

const todayString = dayjs().format("YYYY-MM-DD");

export default function LoanDatePickerModal({
  onSelectDate,
  onClose,
}: {
  onSelectDate: (date: string) => void;
  onClose: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState<string>("");

  const today = new Date();

  const getFormattedDate = (date: Date): string => {
    return date.toISOString().split("T")[0]; // yyyy-mm-dd
  };

  const handleQuickSelect = (
    type: "tomorrow" | "1week" | "2weeks" | "1month"
  ) => {
    const date = new Date();
    switch (type) {
      case "tomorrow":
        date.setDate(date.getDate() + 1);
        break;
      case "1week":
        date.setDate(date.getDate() + 7);
        break;
      case "2weeks":
        date.setDate(date.getDate() + 14);
        break;
      case "1month":
        date.setMonth(date.getMonth() + 1);
        break;
    }
    const formatted = getFormattedDate(date);
    setSelectedDate(formatted);
  };

  return (
    <View className="absolute inset-0 bg-black/50 justify-end">
      <View className="bg-white rounded-t-3xl p-5">
        <GlobalText weight="bold" className="text-lg mb-4">
          상환 날짜 선택
        </GlobalText>

        {/* 빠른 선택 버튼 */}
        <View className="flex-row justify-center flex-wrap gap-x-2 gap-y-2 mb-4">
          <QuickDateButton
            label="내일"
            onPress={() => handleQuickSelect("tomorrow")}
          />
          <QuickDateButton
            label="1주 후"
            onPress={() => handleQuickSelect("1week")}
          />
          <QuickDateButton
            label="2주 후"
            onPress={() => handleQuickSelect("2weeks")}
          />
          <QuickDateButton
            label="한 달 후"
            onPress={() => handleQuickSelect("1month")}
          />
        </View>

        <View>
          {/* 달력 */}
          <Calendar
            // hideDayNames={true}
            minDate={todayString}
            onDayPress={(day: any) => {
              setSelectedDate(day.dateString);
            }}
            // 기존 설정 유지
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#4FC985",
              },
              [todayString]: {
                marked: true,
                dotColor: "#4FC985",
                customStyles: {
                  container: {
                    backgroundColor: "#E0F7EE",
                    borderRadius: 999,
                  },
                  text: {
                    fontFamily: "NEXONLv1Gothic-Bold",
                    color: "#111827",
                  },
                },
              },
            }}
            markingType="custom"
            // 월 헤더 커스터마이징
            renderHeader={(date: Date) => {
              const y = date.getFullYear();
              const m = date.getMonth() + 1;
              return (
                <GlobalText
                  weight="bold"
                  className="text-base text-gray-900 my-2 text-xl"
                >
                  {y} {m}월
                </GlobalText>
              );
            }}
            theme={{
              textDayFontFamily: "NEXONLv1Gothic-Light",
              textMonthFontFamily: "NEXONLv1Gothic-Bold",
              textDayHeaderFontFamily: "NEXONLv1Gothic-Regular",
              arrowColor: "#4FC985",
              monthTextColor: "#111827",
            }}
            style={{ borderRadius: 16 }}
          />
        </View>

        {/* 닫기 버튼 */}
        <TouchableOpacity
          onPress={() => {
            if (selectedDate) onSelectDate(selectedDate);
            onClose();
          }}
          className="mt-6 py-3 rounded-lg bg-gray-200"
        >
          <GlobalText className="text-center text-gray-700">확인</GlobalText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function QuickDateButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-100 px-5 py-2 rounded-lg"
    >
      <GlobalText className="text-md text-gray-700">{label}</GlobalText>
    </TouchableOpacity>
  );
}
