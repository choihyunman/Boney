import { TouchableOpacity, View } from "react-native";
import GlobalText from "@/components/GlobalText";
import { router } from "expo-router";

type Props = {
  title: string;
  loans: any[];
  showCreditorTitle?: boolean;
  onPress?: (loanId: number, color: string) => void;
};

export default function LoanListSection({
  title,
  loans,
  showCreditorTitle = true,
  onPress,
}: Props) {
  const colorPalette = ["#6366F1", "#F59E0B", "#4FC985"];

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

  return (
    <View className="px-6">
      <View className="bg-white rounded-2xl px-6 py-6 shadow-sm mt-4">
        <View className="flex flex-col space-y-6">
          <GlobalText weight="bold" className="text-xl text-gray-800 mb-4">
            {title}
          </GlobalText>

          {loans.map((loan, index) => {
            const dday = calculateDday(loan.due_date);
            const color = colorPalette[index % colorPalette.length];

            return (
              <TouchableOpacity
                key={loan.loan_id}
                activeOpacity={0.8}
                onPress={() => onPress?.(loan.loan_id, color)}
                className="bg-[#F9FAFB] rounded-xl p-4 mb-4"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: color,
                }}
              >
                {showCreditorTitle && (
                  <GlobalText weight="bold" className="text-base mb-2">
                    {loan.child_name}의 대출
                  </GlobalText>
                )}

                <View className="mb-1">
                  <View
                    className="px-3 py-0.5 rounded-full mr-2 self-start mb-1"
                    style={{ backgroundColor: "#D1FADF" }}
                  >
                    <GlobalText className="text-sm text-[#4FC985]">
                      {dday}
                    </GlobalText>
                  </View>
                  <GlobalText className="text-xs text-gray-400 mb-1">
                    {loan.due_date.replace(/-/g, ".")}까지
                  </GlobalText>
                </View>

                <View className="flex-row justify-between items-center mb-2">
                  <GlobalText className="text-sm text-gray-600">
                    전체 대출금
                  </GlobalText>
                  <GlobalText>
                    {loan.loan_amount ? loan.loan_amount.toLocaleString() : 0}원
                  </GlobalText>
                </View>

                <View className="flex-row justify-between items-center mb-2">
                  <GlobalText className="text-sm text-gray-600">
                    남은 대출금
                  </GlobalText>
                  <GlobalText
                    weight="bold"
                    className="text-lg"
                    style={{ color }}
                  >
                    {loan.last_amount ? loan.last_amount.toLocaleString() : 0}원
                  </GlobalText>
                </View>

                <View className="mt-2 h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${
                        (1 - loan.last_amount / loan.loan_amount) * 100
                      }%`,
                      backgroundColor: color,
                    }}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
