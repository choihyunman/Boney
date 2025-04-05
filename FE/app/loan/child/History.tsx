import { View } from "react-native";
import GlobalText from "@/components/GlobalText";
import HistoryItem from "@/components/HistoryItem";
import { useQuery } from "@tanstack/react-query";
import { getLoanHistory } from "@/apis/loanChildApi";

export default function ChildQuestHistoryPage() {
  const useLoanHistoryQuery = useQuery({
    queryKey: ["loanHistoryChild"],
    queryFn: getLoanHistory,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 3,
  });

  const { data: loanHistory } = useLoanHistoryQuery;
  const pastLoans = Array.isArray(loanHistory) ? loanHistory : [];

  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return "미완료";

    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 대출 정렬: 최근 완료된 대출이 상단에 위치하도록 정렬
  const sortedLoans = [...pastLoans].sort((a, b) => {
    return new Date(b.repaid_at).getTime() - new Date(a.repaid_at).getTime();
  });

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <View className="flex-1">
        <View className="bg-white mt-1">
          {sortedLoans.map((loan) => (
            <HistoryItem
              key={loan.loan_id}
              title={formatDate(loan.repaid_at)}
              titleSize="text-base"
              subtitle="상환 완료"
              value={`${loan.loan_amount.toLocaleString()}원`}
            />
          ))}

          {pastLoans.length === 0 && (
            <View className="flex flex-col items-center justify-center py-12">
              <GlobalText className="text-gray-500">
                지난 대출이 없습니다.
              </GlobalText>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
