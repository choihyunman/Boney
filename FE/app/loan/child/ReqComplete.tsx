import Complete from "@/components/Complete";
import { router } from "expo-router";

const handleConfirm = () => {
  router.push("/home");
};

export default function ReqComplete() {
  return (
    <Complete
      onConfirm={handleConfirm}
      title="대출 신청이 완료되었습니다."
      details={[
        {
          label: "대출 금액",
          value: "100,000원",
        },
        {
          label: "신청 날짜",
          value: "2025.03.28",
        },
        {
          label: "마감 날짜",
          value: "2025.04.28",
        },
      ]}
    />
  );
}
