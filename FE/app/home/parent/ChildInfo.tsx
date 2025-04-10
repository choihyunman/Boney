import { View, TouchableOpacity } from "react-native";
import { User, Coins, PlusCircle } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";

interface ChildInfoCardProps {
  name: string;
  creditScore: number;
  loanAmount: number;
  onAllowanceClick: () => void;
}

interface ChildInfoProps {
  children?: ChildInfoCardProps[];
  onAddChild?: () => void;
}

export default function ChildInfo({
  children = [],
  onAddChild,
}: ChildInfoProps) {
  return (
    <View className="bg-white rounded-xl p-5">
      <View className="flex-row justify-between items-center mb-4">
        <GlobalText weight="bold" className="text-lg">
          내 아이
        </GlobalText>
        <TouchableOpacity
          onPress={onAddChild}
          className="flex-row items-center gap-1"
        >
          <PlusCircle size={18} color="#666666" />
          <GlobalText className="text-[#666666] text-sm">아이등록</GlobalText>
        </TouchableOpacity>
      </View>

      <View className="space-y-4">
        {children && children.length > 0 ? (
          children.map((child, index) => (
            <View key={index} className="bg-[#F5F6F8] rounded-xl p-4 mb-4">
              {/* 상단: 이름과 용돈지급 버튼 */}
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-full bg-[#4FC985]/20 items-center justify-center">
                    <User size={18} color="#4FC985" />
                  </View>
                  <GlobalText weight="bold" className="text-lg">
                    {child.name}
                  </GlobalText>
                </View>
                <TouchableOpacity
                  onPress={child.onAllowanceClick}
                  className="bg-[#4FC985] px-3 py-1.5 rounded-full flex-row items-center gap-1"
                >
                  <Coins size={14} color="white" />
                  <GlobalText className="text-white text-sm">용돈</GlobalText>
                </TouchableOpacity>
              </View>

              {/* 중간: 신용점수 */}
              <View className="flex-row justify-between items-center py-2 px-2 border-b border-white">
                <GlobalText className="text-base text-gray-500">
                  신용 점수
                </GlobalText>
                <GlobalText weight="bold" className="text-[#4FC985] text-base">
                  {child.creditScore}점
                </GlobalText>
              </View>

              {/* 하단: 대출 총액 */}
              <View className="flex-row justify-between items-center px-2 pt-2">
                <GlobalText className="text-base text-gray-500">
                  대출 총액
                </GlobalText>
                <GlobalText weight="bold" className="text-base">
                  {child.loanAmount.toLocaleString()}원
                </GlobalText>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-[#F9FAFB] rounded-xl p-4 items-center py-6">
            <User size={24} color="#CBD5E1" />
            <GlobalText className="mt-2 text-gray-500 text-base">
              등록된 아이가 없습니다
            </GlobalText>
          </View>
        )}
      </View>
    </View>
  );
}
