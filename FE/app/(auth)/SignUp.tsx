import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, User, Calendar, Phone } from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";

// 네비게이션 타입 정의
type RootStackParamList = {
  Home: undefined;
  Signup: undefined;
};

type SignupScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Signup"
>;

interface SignupScreenProps {
  navigation: SignupScreenNavigationProp;
}

// 폼 데이터 인터페이스
interface FormData {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: "male" | "female";
  phoneNumber: string;
}

// 에러 상태 인터페이스
interface FormErrors {
  name?: string;
  birth?: string;
  phoneNumber?: string;
  [key: string]: string | undefined;
}

// 사용자 유형
type UserType = "guardian" | "child";

// 아이콘 타입
type IconType = "user" | "calendar" | "phone";

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  // 사용자 유형 선택 상태 (보호자 또는 아이)
  const [userType, setUserType] = useState<UserType>("guardian");

  // 폼 데이터 상태
  const [formData, setFormData] = useState<FormData>({
    name: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    gender: "male", // 기본값
    phoneNumber: "",
  });

  // 오류 메시지 상태
  const [errors, setErrors] = useState<FormErrors>({});

  // 제출 중 상태
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 입력값 변경 처리
  const handleChange = (name: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 전화번호 형식 변환 (하이픈 추가)
  const handlePhoneChange = (value: string): void => {
    const numbers = value.replace(/[^\d]/g, "");

    if (numbers.length <= 11) {
      let formattedValue = numbers;
      if (numbers.length > 3) {
        formattedValue = numbers.slice(0, 3) + "-" + numbers.slice(3);
      }
      if (numbers.length > 7) {
        formattedValue =
          formattedValue.slice(0, 8) + "-" + formattedValue.slice(8);
      }

      handleChange("phoneNumber", formattedValue);
    }
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 이름 검사
    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }

    // 생년월일 검사
    if (!formData.birthYear || !formData.birthMonth || !formData.birthDay) {
      newErrors.birth = "생년월일을 모두 입력해주세요.";
    } else {
      const year = parseInt(formData.birthYear);
      const month = parseInt(formData.birthMonth);
      const day = parseInt(formData.birthDay);

      const currentYear = new Date().getFullYear();

      if (year < 1900 || year > currentYear) {
        newErrors.birth = "올바른 연도를 입력해주세요.";
      } else if (month < 1 || month > 12) {
        newErrors.birth = "올바른 월을 입력해주세요.";
      } else if (day < 1 || day > 31) {
        newErrors.birth = "올바른 일을 입력해주세요.";
      } else {
        // 월별 일수 검사
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day > daysInMonth) {
          newErrors.birth = `${year}년 ${month}월은 ${daysInMonth}일까지입니다.`;
        }
      }
    }

    // 전화번호 검사
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "전화번호를 입력해주세요.";
    } else if (formData.phoneNumber.replace(/-/g, "").length !== 11) {
      newErrors.phoneNumber = "올바른 전화번호를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 처리
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // API 호출 시뮬레이션
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));

      // 회원가입 성공
      setIsSubmitting(false);
      Alert.alert(
        "회원가입 완료",
        `${
          userType === "guardian" ? "보호자" : "아이"
        } 회원가입이 완료되었습니다!`,
        [{ text: "확인", onPress: () => navigation.navigate("Home") }]
      );
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert("오류", "회원가입 중 오류가 발생했습니다.");
    }
  };

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

  // 커스텀 입력 필드 컴포넌트
  interface CustomInputProps extends TextInputProps {
    iconType?: IconType;
    error?: string;
  }

  const CustomInput: React.FC<CustomInputProps> = ({
    iconType,
    error,
    ...props
  }) => (
    <View>
      <View style={styles.inputContainer}>
        {iconType && renderIcon(iconType)}
        <TextInput
          style={[
            styles.input,
            iconType ? { paddingLeft: 40 } : {},
            props.style,
          ]}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>회원가입</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.formContainer}>
            {/* 사용자 유형 선택 토글 */}
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === "guardian" && styles.userTypeButtonActive,
                ]}
                onPress={() => setUserType("guardian")}
              >
                <Text
                  style={[
                    styles.userTypeText,
                    userType === "guardian" && styles.userTypeTextActive,
                  ]}
                >
                  보호자
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === "child" && styles.userTypeButtonActive,
                ]}
                onPress={() => setUserType("child")}
              >
                <Text
                  style={[
                    styles.userTypeText,
                    userType === "child" && styles.userTypeTextActive,
                  ]}
                >
                  아이
                </Text>
              </TouchableOpacity>
            </View>

            {/* 이름 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이름</Text>
              <CustomInput
                iconType="user"
                placeholder="이름을 입력해주세요"
                value={formData.name}
                onChangeText={(text) => handleChange("name", text)}
                error={errors.name}
              />
            </View>

            {/* 생년월일 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>생년월일</Text>
              <View style={styles.birthInputContainer}>
                <View style={{ flex: 2 }}>
                  <CustomInput
                    iconType="calendar"
                    placeholder="YYYY"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={formData.birthYear}
                    onChangeText={(text) => handleChange("birthYear", text)}
                  />
                </View>
                <View style={{ flex: 1, marginHorizontal: 8 }}>
                  <CustomInput
                    placeholder="MM"
                    keyboardType="number-pad"
                    maxLength={2}
                    style={{ textAlign: "center" }}
                    value={formData.birthMonth}
                    onChangeText={(text) => handleChange("birthMonth", text)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <CustomInput
                    placeholder="DD"
                    keyboardType="number-pad"
                    maxLength={2}
                    style={{ textAlign: "center" }}
                    value={formData.birthDay}
                    onChangeText={(text) => handleChange("birthDay", text)}
                  />
                </View>
              </View>
              {errors.birth && (
                <Text style={styles.errorText}>{errors.birth}</Text>
              )}
            </View>

            {/* 성별 선택 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>성별</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={styles.genderButton}
                  onPress={() => handleChange("gender", "male")}
                >
                  <View style={styles.radioOuter}>
                    {formData.gender === "male" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.genderText}>남성</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.genderButton}
                  onPress={() => handleChange("gender", "female")}
                >
                  <View style={styles.radioOuter}>
                    {formData.gender === "female" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.genderText}>여성</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 전화번호 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>전화번호</Text>
              <CustomInput
                iconType="phone"
                placeholder="010-0000-0000"
                keyboardType="number-pad"
                value={formData.phoneNumber}
                onChangeText={handlePhoneChange}
                error={errors.phoneNumber}
              />
            </View>

            {/* 가입하기 버튼 */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "가입 중..." : "가입하기"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
});

export default SignupScreen;
