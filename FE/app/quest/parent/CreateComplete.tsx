import Complete from "@/components/Complete";
import { router } from "expo-router";

export default function CreateComplete() {
  return (
    <Complete
      onConfirm={() => {
        router.replace("/quest/parent/List");
      }}
      title="퀘스트 등록 완료"
      description="퀘스트가 등록되었어요"
    />
  );
}
