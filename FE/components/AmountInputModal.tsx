import {
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Keyboard,
} from "react-native";
import { X, Delete } from "lucide-react-native";
import GlobalText from "./GlobalText";

interface AmountButton {
  value: number;
  label: string;
}

interface AmountInputModalProps {
  visible: boolean;
  onClose: () => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  onComplete: () => void;
  amountButtons?: AmountButton[];
}

export default function AmountInputModal({
  visible,
  onClose,
  amount,
  onAmountChange,
  onComplete,
  amountButtons = [
    { value: 500, label: "500원" },
    { value: 1000, label: "1,000원" },
    { value: 5000, label: "5,000원" },
    { value: 10000, label: "10,000원" },
  ],
}: AmountInputModalProps) {
  // 숫자 포맷팅 함수
  const formatNumber = (num: string) => {
    const number = num.replace(/,/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 숫자 키패드 입력 핸들러
  const handleNumberPress = (value: string) => {
    const newAmount = amount.replace(/,/g, "") + value;
    onAmountChange(formatNumber(newAmount));
  };

  // 금액 버튼 클릭 핸들러
  const handleAmountButtonClick = (value: number) => {
    const currentAmount = amount.replace(/,/g, "") || "0";
    const newAmount = (parseInt(currentAmount) + value).toString();
    onAmountChange(formatNumber(newAmount));
  };

  // 금액 초기화/삭제 핸들러
  const handleClearAmount = () => {
    onAmountChange("");
  };

  // 금액 지우기 핸들러
  const handleDeleteAmount = () => {
    const newAmount = amount.replace(/,/g, "").slice(0, -1);
    onAmountChange(formatNumber(newAmount));
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-5">
          {/* 상단 헤더 */}
          <View className="flex-row justify-between items-center mb-4">
            <GlobalText weight="bold" className="text-lg">
              금액 입력
            </GlobalText>
            <TouchableOpacity
              onPress={handleClose}
              className="bg-gray-100 p-2 rounded-full"
            >
              <X size={20} color="#1f2937" />
            </TouchableOpacity>
          </View>

          {/* 입력된 금액 표시 */}
          <View className="flex-row items-center justify-end mb-4">
            <GlobalText className="text-2xl text-right">{amount}</GlobalText>
            <GlobalText className="text-2xl text-right ml-1">원</GlobalText>
          </View>

          {/* 금액 버튼 */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {amountButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleAmountButtonClick(button.value)}
                className="flex-1 py-3 px-2 bg-gray-100 rounded-xl"
              >
                <View className="items-center">
                  <GlobalText className="text-gray-700">
                    {button.label}
                  </GlobalText>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 숫자 키패드 */}
          <View className="flex-row flex-wrap justify-between">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => handleNumberPress(num.toString())}
                className="w-1/3 py-6 items-center"
              >
                <GlobalText className="text-2xl text-gray-800">
                  {num}
                </GlobalText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={handleDeleteAmount}
              className="w-1/3 py-6 items-center"
            >
              <View className="w-10 h-10 items-center justify-center">
                <Delete size={28} color="#9ca3af" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleNumberPress("0")}
              className="w-1/3 py-6 items-center"
            >
              <GlobalText className="text-2xl text-gray-800">0</GlobalText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onComplete}
              className="w-1/3 py-6 items-center"
            >
              <GlobalText className="text-xl text-gray-800">완료</GlobalText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
