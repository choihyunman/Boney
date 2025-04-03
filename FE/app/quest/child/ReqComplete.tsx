import Complete from "@/components/Complete";
import { router } from "expo-router";
import { useLoanStore } from "@/stores/useLoanChildStore";

const handleConfirm = () => {
  router.replace("/loan/child/ReqList");
};

export default function ReqComplete() {
  const { latestLoan } = useLoanStore();

  return (
    <Complete
      onConfirm={handleConfirm}
      title="퀘스트 완료가 신청되었습니다."
      details={[
        {
          label: "완료일",
          value: `${Number(latestLoan?.loanAmount ?? 0).toLocaleString()}원`,
          valueColor: "#4FC985",
        },
        {
          label: "보상 금액",
          value: latestLoan?.dueDate?.slice(0, 10).replace(/-/g, ".") ?? "-",
        },
      ]}
    />
  );
}
