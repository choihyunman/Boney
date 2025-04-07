import Complete from "@/components/Complete";
import { router } from "expo-router";
import { useLoanStore } from "@/stores/useLoanChildStore";

const handleConfirm = () => {
  router.replace("/");
  router.replace("/loan/child/ReqList");
};

export default function ReqComplete() {
  const { latestLoan } = useLoanStore();

  return (
    <Complete
      onConfirm={handleConfirm}
      title="대출 신청이 완료되었습니다."
      details={[
        {
          label: "대출 금액",
          value: `${Number(latestLoan?.loanAmount ?? 0).toLocaleString()}원`,
          valueColor: "#4FC985",
        },
        {
          label: "마감 날짜",
          value: latestLoan?.dueDate?.slice(0, 10).replace(/-/g, ".") ?? "-",
        },
      ]}
    />
  );
}
