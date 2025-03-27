import React, { useState, useCallback, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, Calendar, Phone } from "lucide-react-native";
import GlobalText from "../../components/GlobalText";
import { useAuthStore } from "@/stores/useAuthStore";
import { router } from "expo-router";

const SignupScreen = () => {
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
  const yearRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);

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

  const handleBirthChange = (
    field: "birthYear" | "birthMonth" | "birthDay",
    value: string
  ) => {
    handleChange(field, value);

    if (field === "birthYear" && value.length === 4) {
      monthRef.current?.focus();
    } else if (field === "birthMonth" && value.length === 2) {
      dayRef.current?.focus();
    }
  };

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

    console.log("📨 [signUp] 회원가입 요청 시작");

    if (isSubmitting) {
      console.log("🚫 이미 가입 요청 중이므로 무시");
      return;
    }

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
      await useAuthStore.getState().user;
      router.replace("/auth/CreatePin");
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
      <View className="mb-5">
        <GlobalText className="text-sm font-medium mb-2 text-gray-700">
          {label}
        </GlobalText>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            // TextInput ref를 사용하여 포커스
            if (key === "birthYear") {
              yearRef.current?.focus();
            } else if (key === "birthMonth") {
              monthRef.current?.focus();
            } else if (key === "birthDay") {
              dayRef.current?.focus();
            }
          }}
          style={{ width: "100%" }}
        >
          <View style={{ width: "100%", position: "relative" }}>
            {iconType && (
              <View
                className="absolute left-3 z-10"
                style={{ top: (48 - 18) / 2 }}
              >
                {renderIcon(iconType)}
              </View>
            )}
            <TextInput
              className={`text-base text-gray-800 px-3 bg-white border border-gray-300 rounded-lg h-12 ${
                iconType ? "pl-10" : ""
              }`}
              style={{
                fontFamily: "NEXONLv1Gothic-Regular",
                height: 48,
                width: "100%",
              }}
              keyboardType={keyboardType}
              maxLength={maxLength}
              value={formData[key]}
              onChangeText={(text) => {
                isPhone ? handlePhoneChange(text) : handleChange(key, text);
              }}
            />
            {formData[key].length === 0 && (
              <GlobalText
                style={{
                  position: "absolute",
                  left: iconType ? 40 : 12,
                  top: (48 - 16) / 2,
                  color: "#9CA3AF",
                  fontSize: 16,
                }}
                weight="regular"
              >
                {placeholder}
              </GlobalText>
            )}
          </View>
        </TouchableOpacity>
        {errors[key] && (
          <GlobalText className="text-red-500 text-xs mt-1">
            {errors[key]}
          </GlobalText>
        )}
      </View>
    );
  };

  // 아이콘 타입
  type IconType = "user" | "calendar" | "phone";

  // 아이콘 렌더링 함수
  const renderIcon = (iconType: IconType) => {
    const iconProps = {
      size: 18,
      color: "#9CA3AF",
      className: "absolute left-3 z-10",
    };

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
    <SafeAreaView className="flex-1 bg-gray-50" edges={["left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 0 }}
        >
          {/* 폼 카드 */}
          <View className="p-4">
            <View className="bg-white rounded-2xl p-5 shadow-sm">
              {/* 사용자 유형 선택 */}
              <View className="flex-row bg-gray-100 rounded-xl mb-6 p-1">
                {["PARENT", "CHILD"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      {
                        flex: 1,
                        paddingVertical: 12,
                        alignItems: "center",
                        borderRadius: 12,
                      },
                      userType === type
                        ? {
                            backgroundColor: "white",
                            shadowColor: "#000",
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                          }
                        : {},
                    ]}
                    onPress={() => setUserType(type)}
                  >
                    <GlobalText
                      weight={userType === type ? "bold" : "regular"}
                      style={{
                        color: userType === type ? "#22C55E" : "#6B7280",
                        fontSize: 16, // 원하는 크기
                      }}
                    >
                      {type === "PARENT" ? "보호자" : "아이"}
                    </GlobalText>
                  </TouchableOpacity>
                ))}
              </View>

              {renderInput("name", "이름", "이름을 입력해주세요.", "user")}

              <View className="mb-5">
                <GlobalText className="text-sm font-medium mb-2 text-gray-700">
                  생년월일
                </GlobalText>
                <View className="flex-row">
                  <View className="flex-[2]">
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => yearRef.current?.focus()}
                    >
                      <View className="relative">
                        <View
                          className="absolute left-3 z-10"
                          style={{ top: (48 - 18) / 2 }}
                        >
                          <Calendar size={18} color="#9CA3AF" />
                        </View>
                        <TextInput
                          ref={yearRef}
                          className="text-base text-gray-800 px-3 bg-white border border-gray-300 rounded-lg h-12 pl-10 text-center"
                          style={{
                            fontFamily: "NEXONLv1Gothic-Regular",
                            height: 48,
                            textAlign: "center",
                          }}
                          keyboardType="number-pad"
                          maxLength={4}
                          value={formData.birthYear}
                          onChangeText={(text) =>
                            handleBirthChange("birthYear", text)
                          }
                        />
                        {formData.birthYear.length === 0 && (
                          <GlobalText
                            weight="regular"
                            style={{
                              position: "absolute",
                              left: 25,
                              right: 0,
                              textAlign: "center",
                              top: (48 - 16) / 2,
                              fontSize: 16,
                              color: "#9CA3AF",
                            }}
                          >
                            YYYY
                          </GlobalText>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-1 mx-2">
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => monthRef.current?.focus()}
                    >
                      <View className="relative">
                        <TextInput
                          ref={monthRef}
                          className="text-base text-gray-800 px-3 bg-white border border-gray-300 rounded-lg h-12 text-center"
                          style={{
                            fontFamily: "NEXONLv1Gothic-Regular",
                            height: 48,
                            textAlign: "center",
                          }}
                          keyboardType="number-pad"
                          maxLength={2}
                          value={formData.birthMonth}
                          onChangeText={(text) =>
                            handleBirthChange("birthMonth", text)
                          }
                        />
                        {formData.birthMonth.length === 0 && (
                          <GlobalText
                            weight="regular"
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              textAlign: "center",
                              top: (48 - 16) / 2,
                              fontSize: 16,
                              color: "#9CA3AF",
                            }}
                          >
                            MM
                          </GlobalText>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-1">
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => dayRef.current?.focus()}
                    >
                      <View className="relative">
                        <TextInput
                          ref={dayRef}
                          className="text-base text-gray-800 px-3 bg-white border border-gray-300 rounded-lg h-12 text-center"
                          style={{
                            fontFamily: "NEXONLv1Gothic-Regular",
                            height: 48,
                            textAlign: "center",
                          }}
                          keyboardType="number-pad"
                          maxLength={2}
                          value={formData.birthDay}
                          onChangeText={(text) =>
                            handleBirthChange("birthDay", text)
                          }
                        />
                        {formData.birthDay.length === 0 && (
                          <GlobalText
                            weight="regular"
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              textAlign: "center",
                              top: (48 - 16) / 2,
                              fontSize: 16,
                              color: "#9CA3AF",
                            }}
                          >
                            DD
                          </GlobalText>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
                {errors.birth && (
                  <GlobalText className="text-red-500 text-xs mt-1">
                    {errors.birth}
                  </GlobalText>
                )}
              </View>

              <View className="mb-5">
                <GlobalText className="text-sm font-medium mb-2 text-gray-700">
                  성별
                </GlobalText>
                <View className="flex-row mt-1">
                  {["MALE", "FEMALE"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      className="flex-row items-center mr-6 py-2"
                      onPress={() => handleChange("gender", g)}
                    >
                      <View className="w-5 h-5 rounded-full border-2 border-green-500 items-center justify-center mr-2">
                        {formData.gender === g && (
                          <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        )}
                      </View>
                      <GlobalText className="text-base text-gray-700">
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
                className={`bg-green-500 rounded-xl h-12 items-center justify-center mt-4 ${
                  isSubmitting ? "bg-gray-400" : ""
                }`}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <GlobalText className="text-white text-base">
                  {isSubmitting ? "가입 중..." : "다음"}
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
