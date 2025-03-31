import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  findNodeHandle,
  UIManager,
} from "react-native";
import { ChevronDown, ChevronUp, Phone, Mail } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";
import { api } from "../../lib/api";
import { router } from "expo-router";
import GlobalText from "../../components/GlobalText";

export default function ChildIndex() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("kakao.com");
  const [customDomain, setCustomDomain] = useState("");
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 도메인 옵션
  const domains = [
    "kakao.com",
    "daum.net",
    "gmail.com",
    "naver.com",
    "직접 입력",
  ];

  // 도메인 선택 부분의 ref
  const domainRef = useRef(null);

  const formatPhoneNumber = (text: string) => {
    // 숫자만 추출
    const cleaned = text.replace(/\D/g, "");

    // 자동으로 하이픈 추가
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(
        7,
        11
      )}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  const validateInputs = () => {
    if (!email) {
      Alert.alert("오류", "이메일을 입력해주세요.");
      return false;
    }

    const domain = isCustomDomain ? customDomain : selectedDomain;
    if (isCustomDomain && !customDomain) {
      Alert.alert("오류", "도메인을 입력해주세요.");
      return false;
    }

    if (!phone) {
      Alert.alert("오류", "전화번호를 입력해주세요.");
      return false;
    }
    if (!/^\d{3}-\d{4}-\d{4}$/.test(phone)) {
      Alert.alert("오류", "올바른 전화번호 형식이 아닙니다.");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);

    try {
      const fullEmail = `${email}@${
        isCustomDomain ? customDomain : selectedDomain
      }`;

      const response = await api.post("/parent/child", {
        user_email: fullEmail,
        user_phone: phone,
      });

      if (response.status === 201) {
        Alert.alert("성공", "자녀 등록이 완료되었습니다.", [
          {
            text: "확인",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      console.log("Error response:", error.response); // 에러 응답 전체 출력
      if (error.response) {
        const status = error.response.status;
        console.log("Status:", status); // 상태 코드 출력
        console.log("Error data:", error.response.data); // 에러 데이터 출력

        switch (status) {
          case 409:
            Alert.alert(
              "오류",
              error.response.data.message || "이미 등록된 사용자입니다."
            );
            break;
          case 404:
            Alert.alert(
              "오류",
              error.response.data.message || "사용자를 찾을 수 없습니다."
            );
            break;
          default:
            Alert.alert(
              "오류",
              error.response.data.message || "자녀 등록에 실패했습니다."
            );
        }
      } else {
        Alert.alert("오류", "서버 연결에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectDomain = (domain: string) => {
    if (domain === "직접 입력") {
      setIsCustomDomain(true);
      setCustomDomain("");
    } else {
      setSelectedDomain(domain);
      setIsCustomDomain(false);
    }
    setShowDomainDropdown(false);
  };

  // 현재 선택된 도메인을 제외한 도메인 목록 가져오기
  const getFilteredDomains = () => {
    return domains.filter(
      (domain) => domain !== selectedDomain || domain === "직접 입력"
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 space-y-6">
        <View className="bg-white p-6 rounded-2xl shadow-sm">
          <View className="space-y-4">
            {/* 이메일 입력 섹션 */}
            <View className="mb-2">
              <GlobalText className="text-sm text-black">
                아이의 이메일
              </GlobalText>

              <View className="flex-row items-center mt-2">
                <GlobalText className="text-xs bg-gray-100 px-1 py-0.5 rounded text-gray-700">
                  카카오톡 {">"} 설정 {">"} 카카오 계정
                </GlobalText>
                <GlobalText className="text-xs text-gray-500">
                  에서 확인할 수 있어요.
                </GlobalText>
              </View>

              {/* 이메일 입력 필드 */}
              <View className="flex-row mt-4">
                {/* 아이디 입력 부분 */}
                <View className="w-36 h-14 relative border border-gray-300 rounded-l-md bg-white">
                  <Mail
                    size={18}
                    color="#999"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: 14,
                      zIndex: 1,
                    }}
                  />
                  <TextInput
                    className="h-full pl-10 text-sm text-[#020817]"
                    placeholder="아이디"
                    placeholderTextColor="#71717A"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* @ 심볼 */}
                <View className="h-14 px-3 justify-center bg-gray-100 border-t border-b border-gray-300">
                  <GlobalText className="text-base text-gray-500">@</GlobalText>
                </View>

                {/* 도메인 선택 부분 */}
                <View className="flex-1">
                  {!isCustomDomain ? (
                    <View>
                      <TouchableOpacity
                        ref={domainRef}
                        onPress={() =>
                          setShowDomainDropdown(!showDomainDropdown)
                        }
                        className="h-14 flex-row items-center justify-between px-3 bg-white border border-gray-300 rounded-r-md"
                      >
                        <GlobalText className="text-sm text-black">
                          {selectedDomain}
                        </GlobalText>
                        <ChevronDown size={16} color="#666" />
                      </TouchableOpacity>

                      {/* 인라인 드롭다운 */}
                      {showDomainDropdown && (
                        <View className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-b-lg border-t-0 shadow-sm z-10">
                          {getFilteredDomains().map((domain, index, array) => (
                            <TouchableOpacity
                              key={domain}
                              onPress={() => selectDomain(domain)}
                              className={`px-4 py-3 ${
                                index < array.length - 1
                                  ? "border-b border-gray-200"
                                  : ""
                              }`}
                            >
                              <GlobalText className="text-sm text-black">
                                {domain}
                              </GlobalText>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View className="h-14 flex-row items-center border border-gray-300 rounded-r-md px-2 bg-white">
                      <TextInput
                        className="flex-1 h-full text-sm text-black"
                        placeholder="직접 입력"
                        placeholderTextColor="#71717A"
                        value={customDomain}
                        onChangeText={setCustomDomain}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() => {
                          setIsCustomDomain(false);
                          setSelectedDomain("kakao.com");
                        }}
                      >
                        <ChevronDown size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* 핸드폰 번호 입력 섹션 */}
            <View className="mt-2">
              <GlobalText className="text-sm text-black">
                아이의 핸드폰 번호
              </GlobalText>

              <GlobalText className="text-xs text-gray-500 mt-2 mb-4">
                아이가 사용하는 핸드폰 번호를 입력하세요.
              </GlobalText>

              <View className="relative h-14">
                <View className="flex-1 border border-gray-300 rounded-md bg-white">
                  <Phone
                    size={18}
                    color="#999"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: 14,
                      zIndex: 1,
                    }}
                  />
                  <TextInput
                    className="h-full pl-10 text-sm text-[#020817]"
                    placeholder="000-0000-0000"
                    placeholderTextColor="#71717A"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    maxLength={13}
                  />
                </View>
              </View>
            </View>

            {/* 등록 버튼 */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              className="h-12 bg-[#4fc885] rounded-xl items-center justify-center mt-6"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <GlobalText className="text-white text-sm">등록하기</GlobalText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
