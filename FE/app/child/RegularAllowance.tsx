import React, { useState, useEffect } from "react";
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
import { useLocalSearchParams, router } from "expo-router";
import {
  createRegularAllowance,
  updateRegularAllowance,
  deleteRegularAllowance,
  verifyPassword,
} from "../../apis/childApi";
import { useChildDetailStore } from "../../stores/useChildDetailStore";
import { PinInput } from "../../components/PinInput";
import { getChildProfileImage } from "@/utils/getChildProfileImage";
import { CustomAlert } from "../../components/CustomAlert";

const DAYS = [
  { id: 1, name: "월요일" },
  { id: 2, name: "화요일" },
  { id: 3, name: "수요일" },
  { id: 4, name: "목요일" },
  { id: 5, name: "금요일" },
  { id: 6, name: "토요일" },
  { id: 7, name: "일요일" },
];

const DATES = Array.from({ length: 31 }, (_, i) => ({
  id: i + 1,
  name: `${i + 1}일`,
}));

export default function RegularAllowance() {
  const params = useLocalSearchParams();
  const childName = params.childName as string;
  const childGender = params.childGender as string;
  const { childDetail } = useChildDetailStore();

  const [isWeekly, setIsWeekly] = useState(
    childDetail?.regularTransfer?.scheduledFrequency === "weekly"
  );
  const [selectedDay, setSelectedDay] = useState(
    childDetail?.regularTransfer?.scheduledFrequency === "weekly"
      ? DAYS.find((day) => day.id === childDetail.regularTransfer?.startDate) ||
          DAYS[0]
      : DAYS[0]
  );
  const [selectedDate, setSelectedDate] = useState(
    childDetail?.regularTransfer?.scheduledFrequency === "monthly"
      ? DATES.find(
          (date) => date.id === childDetail.regularTransfer?.startDate
        ) || DATES[0]
      : DATES[0]
  );
  const [isDayPickerVisible, setIsDayPickerVisible] = useState(false);
  const [amount, setAmount] = useState(
    childDetail?.regularTransfer?.scheduledAmount
      ? childDetail.regularTransfer.scheduledAmount.toLocaleString()
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [actionType, setActionType] = useState<"save" | "cancel">("save");

  // Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Initialize form with data from childDetail if available
  useEffect(() => {
    if (childDetail?.regularTransfer) {
      const { scheduledAmount, scheduledFrequency, startDate } =
        childDetail.regularTransfer;

      // Set amount
      setAmount(scheduledAmount.toString());

      // Set frequency
      setIsWeekly(scheduledFrequency === "weekly");

      // Set day/date
      if (scheduledFrequency === "weekly") {
        const day = DAYS.find((day) => day.id === startDate) || DAYS[0];
        setSelectedDay(day);
      } else {
        const date = DATES.find((date) => date.id === startDate) || DATES[0];
        setSelectedDate(date);
      }
    }
  }, [childDetail]);

  const handlePinComplete = async (password: string) => {
    try {
      const response = await verifyPassword(password);
      if (response.data.isMatched) {
        if (actionType === "save") {
          await handleSaveAction();
        } else {
          await handleCancelAction();
        }
      } else {
        setAlertTitle("오류");
        setAlertMessage("비밀번호가 일치하지 않습니다");
        setAlertType("error");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("비밀번호 검증 실패:", error);
      setAlertTitle("오류");
      setAlertMessage("비밀번호 검증에 실패했습니다");
      setAlertType("error");
      setShowAlert(true);
    }
    setShowPinInput(false);
  };

  const handleAmountChange = (text: string) => {
    // 쉼표를 제거하고 숫자만 남김
    const numericValue = text.replace(/,/g, "");
    // 숫자가 아닌 문자는 제거
    const cleanValue = numericValue.replace(/[^0-9]/g, "");
    // 숫자를 쉼표가 포함된 문자열로 변환
    const formattedValue = cleanValue
      ? Number(cleanValue).toLocaleString()
      : "";
    setAmount(formattedValue);
  };

  const handleSaveAction = async () => {
    if (!childDetail?.childId) return;

    try {
      setLoading(true);
      const data = {
        scheduledAmount: amount.replace(/,/g, ""),
        scheduledFrequency: isWeekly
          ? ("weekly" as const)
          : ("monthly" as const),
        startDate: isWeekly ? selectedDay.id : selectedDate.id,
      };

      if (childDetail.regularTransfer === null) {
        await createRegularAllowance(childDetail.childId, data);
        setAlertTitle("알림");
        setAlertMessage("정기 용돈이 설정되었습니다");
        setAlertType("success");
        setShowAlert(true);
        setShouldNavigate(true);
      } else {
        await updateRegularAllowance(childDetail.childId, data);
        setAlertTitle("알림");
        setAlertMessage("정기 용돈이 설정이 수정되었습니다");
        setAlertType("success");
        setShowAlert(true);
        setShouldNavigate(true);
      }
    } catch (error) {
      console.error("정기 용돈 설정 실패:", error);
      setAlertTitle("오류");
      setAlertMessage("정기 용돈 설정에 실패했습니다");
      setAlertType("error");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAction = async () => {
    try {
      if (!childDetail?.childId) return;

      setLoading(true);
      await deleteRegularAllowance(childDetail.childId);
      setAlertTitle("알림");
      setAlertMessage("정기 용돈이 해지되었습니다");
      setAlertType("success");
      setShowAlert(true);
      setShouldNavigate(true);
    } catch (error) {
      console.error("정기 용돈 해지 실패:", error);
      setAlertTitle("오류");
      setAlertMessage("정기 용돈 해지에 실패했습니다");
      setAlertType("error");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setActionType("save");
    setShowPinInput(true);
  };

  const handleCancel = () => {
    setActionType("cancel");
    setShowPinInput(true);
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    if (shouldNavigate) {
      router.replace("/child");
    }
  };

  if (showPinInput) {
    return (
      <PinInput
        title="비밀번호를 입력해주세요"
        subtitle="정기 용돈 설정을 위해 비밀번호가 필요합니다"
        onPasswordComplete={handlePinComplete}
        onBackPress={() => setShowPinInput(false)}
      />
    );
  }

  return (
    <View className="flex-1 bg-[#F5F6F8] px-4 py-3">
      {/* Card Container */}
      <View className="flex bg-white rounded-2xl p-4">
        {/* Profile Circle */}
        <View className="items-center mb-5">
          <View className="w-[68px] h-[68px] rounded-full overflow-hidden">
            <Image
              source={getChildProfileImage(childGender)}
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
          <GlobalText weight="bold" className="text-md text-[#020817] mb-2">
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
          <GlobalText weight="bold" className="text-md text-[#020817] mb-2">
            {isWeekly ? "지급 요일" : "지급일"}
          </GlobalText>
          <TouchableOpacity
            onPress={() => setIsDayPickerVisible(true)}
            className="h-10 px-3 bg-white rounded-lg border border-gray-200 flex-row items-center justify-between"
          >
            <GlobalText className="text-md text-[#020817]">
              {isWeekly ? selectedDay.name : selectedDate.name}
            </GlobalText>
            <ChevronDown size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* 용돈 금액 */}
        <View className="mb-2">
          <GlobalText weight="bold" className="text-md text-[#020817] mb-2">
            용돈 금액
          </GlobalText>
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 h-11 px-3 bg-white rounded-lg border border-gray-200 text-md"
              placeholder="금액을 입력해주세요"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={handleAmountChange}
              style={{ fontFamily: "NEXONLv1Gothic-Regular" }}
            />
            <GlobalText className="ml-2 text-md text-[#020817]">원</GlobalText>
          </View>
        </View>

        {/* 자동 지급 알림 */}
        <View className="flex-row items-center mb-5">
          <Calendar size={12} color="#9CA3AF" />
          <GlobalText className="ml-2 text-sm text-gray-500">
            {isWeekly
              ? `매주 ${selectedDay.name}에 자동으로 지급됩니다`
              : `매월 ${selectedDate.name}에 자동으로 지급됩니다`}
          </GlobalText>
        </View>

        {/* 버튼 */}
        <View>
          <TouchableOpacity
            className="h-10 bg-[#4FC985] rounded-lg items-center justify-center"
            onPress={handleSave}
            disabled={loading || !amount}
          >
            <GlobalText className="text-sm text-white">
              {loading ? "저장 중..." : "용돈 설정하기"}
            </GlobalText>
          </TouchableOpacity>

          {childDetail?.regularTransfer && (
            <TouchableOpacity
              className="h-10 mt-2 bg-white border border-red-500 rounded-lg items-center justify-center mb-8"
              onPress={handleCancel}
              disabled={loading}
            >
              <GlobalText className="text-sm text-red-500">해지하기</GlobalText>
            </TouchableOpacity>
          )}
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

      <View className="flex p-4">
        {/* 구분선 */}
        <View className="h-[1px] bg-gray-200 mt-2 mb-5" />

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
            "이미 설정돼있더라도 새로 입력 시 재설정돼요.",
          ].map((text, index) => (
            <View key={index} className="flex-row items-start mb-1.5">
              <View className="mt-[5px] mr-2 w-1.5 h-1.5 rounded-full bg-[#4FC985]" />
              <GlobalText
                className="text-sm text-gray-600"
                style={{ lineHeight: 20 }}
              >
                {text}
              </GlobalText>
            </View>
          ))}
        </View>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={handleAlertClose}
      />
    </View>
  );
}
