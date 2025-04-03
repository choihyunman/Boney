import { useState } from "react";
import { View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Home } from "lucide-react-native";
import GlobalText from "../../../components/GlobalText";
import AmountInputModal from "../../../components/AmountInputModal";
import DatePickerModal from "../../../components/DatePickerModal";
import { router } from "expo-router";
import CustomTextArea from "@/components/CustomTextInput";

export default function QuestCreatePage() {
  const [dueDate, setDueDate] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [message, setMessage] = useState("");
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  //   const { setQuestRequest } = useQuestRequestStore();

  const handleSubmitQuest = () => {
    if (!rewardAmount || !dueDate) return;

    const numeric = Number(rewardAmount.replace(/,/g, ""));
    // setQuestRequest("reward", isNaN(numeric) ? 0 : numeric);
    // setQuestRequest("dueDate", dueDate);
    // setQuestRequest("message", message);
    router.push("/quest/parent/CreateComplete");
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <ScrollView className="flex-1 px-6 mt-6 pb-20">
        <View className="bg-white rounded-xl shadow-sm p-5">
          <GlobalText weight="bold" className="text-lg text-gray-800 mb-6">
            퀘스트 설정하기
          </GlobalText>
          {/* 퀘스트 아이콘 + 제목 + 카테고리 */}
          <View className="flex-row items-center bg-[#F9FAFB] rounded-xl p-4 shadow-sm mb-6">
            <View className="h-12 w-12 rounded-full bg-[#e6f7ef] items-center justify-center mr-4">
              <Home className="h-6 w-6 text-[#4FC985]" />
            </View>
            <View>
              <GlobalText className="text-base text-gray-800">
                설거지 하기
              </GlobalText>
              <GlobalText className="text-sm text-gray-500">집안일</GlobalText>
            </View>
          </View>
          {/* 날짜 입력 */}
          <TouchableOpacity
            onPress={() => {
              setDueDate("");
              setShowDateModal(true);
            }}
            className="mb-6"
          >
            {dueDate ? (
              <GlobalText className="text-lg text-gray-800">
                <GlobalText weight="bold" className="text-2xl text-[#4FC985]">
                  {dueDate}
                </GlobalText>{" "}
                까지 완료하면
              </GlobalText>
            ) : (
              <GlobalText className="text-xl text-gray-400">
                언제까지 완료해야 하나요?
              </GlobalText>
            )}
          </TouchableOpacity>

          {/* 금액 입력 */}
          {dueDate ? (
            <TouchableOpacity
              onPress={() => {
                setRewardAmount("");
                setShowAmountModal(true);
              }}
              className="mb-6"
            >
              {rewardAmount ? (
                <GlobalText className="text-lg text-gray-800">
                  <GlobalText weight="bold" className="text-2xl text-[#4FC985]">
                    {rewardAmount}
                  </GlobalText>{" "}
                  원을 보상으로 지급해요
                </GlobalText>
              ) : (
                <GlobalText className="text-xl text-gray-400">
                  얼마를 보상으로 지급할까요?
                </GlobalText>
              )}
            </TouchableOpacity>
          ) : null}

          {/* 하고 싶은 말 입력 */}
          {dueDate && rewardAmount ? (
            <View className="bg-gray-50 rounded-xl p-4 mb-6 mt-6">
              <GlobalText className="text-sm text-gray-700 mb-2">
                아이에게 전하고 싶은 말
              </GlobalText>
              <CustomTextArea
                value={message}
                onChangeText={setMessage}
                placeholder="예: 설거지 끝나면 같이 아이스크림 먹자 😊"
                height={96}
                maxLength={150}
              />
            </View>
          ) : null}

          {/* 등록 버튼 */}
          <TouchableOpacity
            onPress={handleSubmitQuest}
            disabled={!dueDate || !rewardAmount}
            className={`w-full py-4 rounded-lg ${
              dueDate && rewardAmount ? "bg-[#4FC985]" : "bg-gray-200"
            }`}
          >
            <GlobalText
              weight="bold"
              className={`text-center ${
                dueDate && rewardAmount ? "text-white" : "text-gray-400"
              }`}
            >
              퀘스트 등록하기
            </GlobalText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 모달: 날짜 선택 */}
      {showDateModal && (
        <DatePickerModal
          onSelectDate={(date) => {
            setDueDate(date);
            setShowDateModal(false);
          }}
          onClose={() => setShowDateModal(false)}
        />
      )}

      {/* 모달: 금액 입력 */}
      <AmountInputModal
        visible={showAmountModal}
        onClose={() => setShowAmountModal(false)}
        amount={rewardAmount}
        onAmountChange={setRewardAmount}
        onComplete={() => setShowAmountModal(false)}
      />
    </View>
  );
}
