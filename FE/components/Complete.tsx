import { View, TouchableOpacity } from "react-native";
import { CheckCircle } from "lucide-react-native";
import GlobalText from "./GlobalText";

export interface DetailItem {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
  valueColor?: string;
  extraDescription?: string;
}

interface CompleteProps {
  onConfirm: () => void;
  title: string;
  description?: string;
  details?: DetailItem[];
}

const Complete = ({
  onConfirm,
  title,
  description,
  details = [],
}: CompleteProps) => {
  return (
    <View className="flex-1 bg-[#F5F6F8] px-6 pt-16 pb-8 items-center gap-6">
      {/* Spacer */}
      <View className="w-px" />

      {/* 완료 메시지 */}
      <View className="items-center pb-10">
        <View className="w-24 h-30 mb-6 items-center justify-start">
          <CheckCircle size={96} color="#4FC985" />
        </View>
        <GlobalText weight="bold" className="text-2xl text-gray-800">
          {title}
        </GlobalText>
        {description && (
          <GlobalText className="text-sm text-gray-500 mt-2 text-center">
            {description}
          </GlobalText>
        )}
      </View>

      {/* 상세 내역 정보 카드 */}
      <View className="w-full bg-white rounded-xl px-6 py-3 mb-8">
        <View className="flex flex-col gap-2">
          {details.map((item, index) => (
            <View key={index}>
              <View className="flex-row justify-between items-center py-4">
                {/* 아이콘 + 라벨 */}
                <View className="flex-row items-center">
                  {item.icon && (
                    <View className="h-10 w-10 rounded-full bg-[#e6f7ef] items-center justify-center mr-3">
                      {item.icon}
                    </View>
                  )}
                  <GlobalText className="text-base text-gray-500">
                    {item.label}
                  </GlobalText>
                </View>

                {/* 값 */}
                {typeof item.value === "string" ? (
                  <GlobalText
                    weight="bold"
                    className="text-lg font-lg tracking-wider"
                    style={[
                      {
                        flexShrink: 1,
                        flexWrap: "wrap",
                        lineHeight: 24,
                        textAlign: "right",
                        marginLeft: 10,
                      },
                      item.valueColor ? { color: item.valueColor } : undefined,
                    ]}
                  >
                    {item.value}
                  </GlobalText>
                ) : (
                  <View className="flex-1 items-end" style={{ marginLeft: 10 }}>
                    {item.value}
                  </View>
                )}
              </View>

              {/* 부가 설명 박스 */}
              {item.extraDescription && (
                <View className="bg-[#ECFDF3] rounded-md px-4 py-3 mt-1">
                  <GlobalText className="text-sm text-[#4FC985]">
                    {item.extraDescription}
                  </GlobalText>
                </View>
              )}

              {/* Divider */}
              {index < details.length - 1 && (
                <View className="h-px bg-gray-200 mx-1 mt-1" />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 확인 버튼 */}
      <TouchableOpacity
        onPress={onConfirm}
        className="w-full bg-[#4FC985] rounded-lg py-4 items-center"
      >
        <GlobalText weight="bold" className="text-white text-base">
          확인
        </GlobalText>
      </TouchableOpacity>
    </View>
  );
};

export default Complete;
