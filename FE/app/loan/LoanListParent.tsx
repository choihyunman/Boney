import { useState } from "react";
import { View, ScrollView } from "react-native";
import LoanSummary from "./LoanSummary";
import LoanListSection from "./LoanListSection";

type Loan = {
  id: string;
  creditor: string;
  dueDate: string;
  totalAmount: number;
  remainingAmount: number;
};

export default function ReqListParent() {
  const [loans, setLoans] = useState<Loan[]>([
    {
      id: "1",
      creditor: "김짤랑",
      dueDate: "2025-03-20",
      totalAmount: 20000,
      remainingAmount: 15000,
    },
    {
      id: "2",
      creditor: "김짤랑",
      dueDate: "2025-04-29",
      totalAmount: 15000,
      remainingAmount: 10000,
    },
  ]);

  return (
    <ScrollView className="flex-1 bg-[#F9FAFB]">
      <LoanSummary
        title="진행 중인 대출"
        count={loans.length}
        totalAmount={25000}
      />
      <LoanListSection
        title="대출 목록"
        loans={loans}
        showCreditorTitle={true}
      />
    </ScrollView>
  );
}
