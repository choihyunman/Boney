import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
} from "react-native";
import { ArrowLeft, CreditCard } from "lucide-react-native";
import { useAccountStore } from "@/stores/useAccountStore";
import { BankDropdown } from "@/components/BankDropdown";

export default function LinkAccount() {
  const { bank, accountNumber, setAccountNumber, submitAccountInfo } =
    useAccountStore();
  
  const handleSubmit = async () => {
    if (!bank || !accountNumber) {
      Alert.alert('입력 오류', '은행과 계좌번호를 모두 입력해주세요.');
      return;
    }
  }
  
  return (
   <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>계좌 연동하기</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>은행 계좌 인증을 진행해 주세요.</Text>
        <Text style={styles.cardSubtitle}>
          회원님의 실명과 계좌에 등록된 이름이 일치해야{'\n'}인증이 가능합니다.
        </Text>

        <Text style={styles.label}>은행 선택</Text>
        <BankDropdown />

        <Text style={styles.label}>계좌번호</Text>
        <View style={styles.accountInputContainer}>
          <CreditCard size={18} color="#9CA3AF" />
          <TextInput
            style={styles.accountPlaceholder}
            placeholder="- 없이 입력해주세요"
            keyboardType="number-pad"
            value={accountNumber}
            onChangeText={setAccountNumber}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>계좌 인증하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    marginRight: 16,
  },
  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  headerIconImage: {
    width: "100%",
    height: "100%",
  },
  headerTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 20,
    color: "black",
  },
  content: {
    flex: 1,
    padding: 32,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 24,
  },
  cardTitle: {
    fontFamily: "Inter-Medium",
    fontSize: 18,
    color: "black",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "black",
  },
  selectButton: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 13,
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectButtonText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "black",
  },
  selectIcon: {
    width: 16,
    height: 16,
  },
  accountInputContainer: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  accountIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  accountPlaceholder: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#71717A",
  },
  submitButton: {
    height: 48,
    backgroundColor: "#4FC885",
    borderRadius: 12,
    opacity: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "white",
  },
});
