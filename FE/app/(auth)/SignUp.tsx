import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, Calendar, Phone } from "lucide-react-native";
import GlobalText from "../../components/GlobalText";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "expo-router";

const SignupScreen = () => {
  const router = useRouter();

  const [userType, setUserType] = useState("PARENT");
  const [formData, setFormData] = useState({
    name: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    gender: "MALE",
    phoneNumber: "",
    role: "PARENT",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    birth?: string;
    phoneNumber?: string;
    [key: string]: string | undefined;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (name: keyof typeof formData, value: string) => {
      setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        // console.log("🧠 현재 formData:", updated);
        return updated;
      });
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handlePhoneChange = useCallback(
    (value: string) => {
      const numbers = value.replace(/[^\d]/g, "");
      if (numbers.length <= 11) {
        let formatted = numbers;
        if (numbers.length > 3)
          formatted = numbers.slice(0, 3) + "-" + numbers.slice(3);
        if (numbers.length > 7)
          formatted = formatted.slice(0, 8) + "-" + formatted.slice(8);
        handleChange("phoneNumber", formatted);
      }
    },
    [handleChange]
  );

  const validateForm = () => {
    const newErrors: {
      name?: string;
      birth?: string;
      phoneNumber?: string;
    } = {};
    const { name, birthYear, birthMonth, birthDay, phoneNumber } = formData;
    if (!name.trim()) newErrors.name = "이름을 입력해주세요.";
    if (!birthYear || !birthMonth || !birthDay) {
      newErrors.birth = "생년월일을 모두 입력해주세요.";
    } else {
      const y = +birthYear,
        m = +birthMonth,
        d = +birthDay,
        now = new Date().getFullYear();
      if (y < 1900 || y > now) newErrors.birth = "올바른 연도";
      else if (m < 1 || m > 12) newErrors.birth = "올바른 월";
      else if (d < 1 || d > 31) newErrors.birth = "올바른 일";
      else {
        const daysInMonth = new Date(y, m, 0).getDate();
        if (d > daysInMonth)
          newErrors.birth = `${y}년 ${m}월은 ${daysInMonth}일까지입니다.`;
      }
    }
    if (!phoneNumber || phoneNumber.replace(/-/g, "").length !== 11) {
      newErrors.phoneNumber = "올바른 전화번호를 입력해주세요.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    const payload = {
      userName: formData.name,
      userBirth: `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`,
      userGender: formData.gender,
      userPhone: formData.phoneNumber,
      role: userType,
    };

    console.log("🚀 회원가입 제출 데이터:", payload);

    try {
      await useAuthStore.getState().signUp(payload);

      setIsSubmitting(false);
      Alert.alert(
        "회원가입 완료",
        `${
          userType === "PARENT" ? "보호자" : "아이"
        } 회원가입이 완료되었습니다!`,
        [{ text: "확인", onPress: () => router.replace("/(auth)/LinkAccount") }]
      );
    } catch (error) {
      setIsSubmitting(false);
      console.error("❌ 회원가입 실패:", error);
      Alert.alert("오류", "회원가입 중 오류가 발생했습니다.");
    }
  };

  const renderInput = (
    key: keyof typeof formData,
    label: string,
    placeholder: string,
    iconType?: IconType | null,
    keyboardType: "default" | "number-pad" = "default",
    maxLength?: number
  ) => {
    const isPhone = key === "phoneNumber";
    return (
      <View style={styles.inputGroup}>
        <GlobalText style={styles.label}>{label}</GlobalText>
        <View style={styles.inputContainer}>
          {iconType && renderIcon(iconType)}
          <TextInput
            style={[styles.input, { paddingLeft: iconType ? 40 : 12 }]}
            placeholder={placeholder || label}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
            maxLength={maxLength}
            value={formData[key]}
            onChangeText={(text) => {
              // console.log(`📥 [${key}] 입력값:`, text);
              isPhone ? handlePhoneChange(text) : handleChange(key, text);
            }}
            onFocus={() => {
              // console.log(`🧲 [${key}] 포커스 됨`);
            }}
          />
        </View>
        {errors[key] && (
          <GlobalText style={styles.errorText}>{errors[key]}</GlobalText>
        )}
      </View>
    );
  };

  // 아이콘 타입
  type IconType = "user" | "calendar" | "phone";

  // 아이콘 렌더링 함수
  const renderIcon = (iconType: IconType) => {
    const iconProps = { size: 18, color: "#9CA3AF", style: styles.inputIcon };

    switch (iconType) {
      case "user":
        return <User {...iconProps} />;
      case "calendar":
        return <Calendar {...iconProps} />;
      case "phone":
        return <Phone {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <GlobalText style={styles.headerTitle}>회원가입</GlobalText>
            <View style={{ width: 40 }} />
          </View>

          {/* 폼 카드 */}
          <View style={styles.formContainer}>
            <View style={styles.card}>
              {/* 사용자 유형 선택 */}
              <View style={styles.userTypeContainer}>
                {["PARENT", "CHILD"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.userTypeButton,
                      userType === type && styles.userTypeButtonActive,
                    ]}
                    onPress={() => setUserType(type)}
                  >
                    <GlobalText
                      style={[
                        styles.userTypeText,
                        userType === type && styles.userTypeTextActive,
                      ]}
                    >
                      {type === "PARENT" ? "보호자" : "아이"}
                    </GlobalText>
                  </TouchableOpacity>
                ))}
              </View>

              {renderInput("name", "이름", "이름을 입력해주세요.")}

              <View style={styles.inputGroup}>
                <GlobalText style={styles.label}>생년월일</GlobalText>
                <View style={styles.birthInputContainer}>
                  <View style={{ flex: 2 }}>
                    <View style={styles.inputContainer}>
                      <Calendar
                        size={18}
                        color="#9CA3AF"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, { paddingLeft: 40 }]}
                        placeholder="YYYY"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        maxLength={4}
                        value={formData.birthYear}
                        onChangeText={(text) => handleChange("birthYear", text)}
                      />
                    </View>
                  </View>

                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={[styles.input, { textAlign: "center" }]}
                        placeholder="MM"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        maxLength={2}
                        value={formData.birthMonth}
                        onChangeText={(text) =>
                          handleChange("birthMonth", text)
                        }
                      />
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={[styles.input, { textAlign: "center" }]}
                        placeholder="DD"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        maxLength={2}
                        value={formData.birthDay}
                        onChangeText={(text) => handleChange("birthDay", text)}
                      />
                    </View>
                  </View>
                </View>
                {errors.birth && (
                  <GlobalText style={styles.errorText}>
                    {errors.birth}
                  </GlobalText>
                )}
              </View>

              <View style={styles.inputGroup}>
                <GlobalText style={styles.label}>성별</GlobalText>
                <View style={styles.genderContainer}>
                  {["MALE", "FEMALE"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={styles.genderButton}
                      onPress={() => handleChange("gender", g)}
                    >
                      <View style={styles.radioOuter}>
                        {formData.gender === g && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      <GlobalText style={styles.genderText}>
                        {g === "MALE" ? "남성" : "여성"}
                      </GlobalText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {renderInput(
                "phoneNumber",
                "전화번호",
                "010-0000-0000",
                "phone",
                "number-pad"
              )}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <GlobalText style={styles.submitButtonText}>
                  {isSubmitting ? "가입 중..." : "가입하기"}
                </GlobalText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  formContainer: {
    padding: 16,
  },
  userTypeContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginBottom: 24,
    padding: 4,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  userTypeButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  userTypeTextActive: {
    color: "#4FC985",
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#374151",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    height: 48,
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  birthInputContainer: {
    flexDirection: "row",
  },
  genderContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  genderButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    paddingVertical: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4FC985",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4FC985",
  },
  genderText: {
    fontSize: 16,
    color: "#374151",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#4FC985",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
});
