import Complete, { DetailItem } from "@/components/Complete";
import { useRepaymentResultStore } from "@/stores/useLoanChildStore";
import { router } from "expo-router";

export default function RepaymentComplete() {
  const { repaymentResult, reset: resetRepaymentResult } =
    useRepaymentResultStore();

  // 신용 점수에 따른 색상 결정
  const getCreditScoreColor = (score: number) => {
    if (score >= 80) return "text-[#4FC985]-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const detailItems: DetailItem[] = [
    {
      label: "상환 금액",
      value: `${repaymentResult?.repayment_amount.toLocaleString()}원`,
    },
    {
      label: "남은 대출액",
      value: `${repaymentResult?.last_amount.toLocaleString()}원`,
    },
  ];

  if (repaymentResult?.loan_status === "REPAID") {
    detailItems.push({
      label: "현재 신용 점수",
      value: `${repaymentResult?.child_credit_score}점`,
      valueColor: getCreditScoreColor(repaymentResult?.child_credit_score),
      extraDescription: "전액 상환으로 신용 점수가 10점 올랐어요!",
    });
  }

  return (
    <Complete
      title="상환 완료"
      description="상환이 완료되었습니다."
      onConfirm={() => {
        router.replace("/loan/child/LoanList");
      }}
      details={detailItems}
    />
  );
}
