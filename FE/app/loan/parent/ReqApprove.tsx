import React from "react";
import { useRouter } from "expo-router";
import Complete from "@/components/Complete";
import { useApproveStore } from "@/stores/useLoanParentStore";

export default function ReqApprovePage() {
  const router = useRouter();
  const { approve, reset, isLoaded } = useApproveStore();

  const handleConfirm = async () => {
    reset();
    router.replace("/loan/parent/LoanList");
  };

  if (!isLoaded) return null;

  return (
    <Complete
      onConfirm={handleConfirm}
      title="대출 승인이 완료되었습니다."
      details={[
        {
          label: "채무자",
          value: approve.data?.child_name ?? "",
        },
        {
          label: "대출 금액",
          value: `${Number(approve.data?.loan_amount ?? 0).toLocaleString()}원`,
        },
        {
          label: "대출 기한",
          value: approve.data?.due_date ?? "",
        },
      ]}
    />
  );
}
