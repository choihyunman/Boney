import React from "react";
import { View, Text } from "react-native";
import { Check } from "lucide-react-native";

interface TransferProgressProps {
  currentStep: number;
}

export default function TransferProgress({
  currentStep,
}: TransferProgressProps) {
  const steps = [
    { number: 1, label: "받는 사람" },
    { number: 2, label: "금액" },
    { number: 3, label: "확인" },
  ];

  return (
    <View className="px-5 py-3 bg-[#F9FAFB]">
      <View className="flex-row items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <View className="items-center flex-1">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  step.number <= currentStep ? "bg-[#4FC985]" : "bg-gray-200"
                }`}
              >
                {step.number < currentStep ? (
                  <Check size={20} color="white" />
                ) : (
                  <Text
                    style={{
                      color: step.number <= currentStep ? "white" : "#9CA3AF",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    {step.number}
                  </Text>
                )}
              </View>
              <Text
                className={`text-xs mt-1 ${
                  step.number <= currentStep
                    ? "font-medium text-[#4FC985]"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                className={`flex-1 h-1 ${
                  step.number < currentStep ? "bg-[#4FC985]" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}
