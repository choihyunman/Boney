import React from "react";
import {
  Home,
  BookOpen,
  Users,
  Heart,
  MoreHorizontal,
} from "lucide-react-native";

interface QuestIconResult {
  Icon:
    | typeof Home
    | typeof BookOpen
    | typeof Users
    | typeof Heart
    | typeof MoreHorizontal;
  backgroundColor: string;
  iconColor: string;
}

export const getquestIcon = (category: string): QuestIconResult => {
  switch (category) {
    case "집안일":
      return {
        Icon: Home,
        backgroundColor: "bg-[#e2f8ed]",
        iconColor: "#4FC985",
      };
    case "학습":
      return {
        Icon: BookOpen,
        backgroundColor: "bg-[#e2f8ed]",
        iconColor: "#4FC985",
      };
    case "우리가족":
      return {
        Icon: Users,
        backgroundColor: "bg-[#e2f8ed]",
        iconColor: "#4FC985",
      };
    case "생활습관":
      return {
        Icon: Heart,
        backgroundColor: "bg-[#e2f8ed]",
        iconColor: "#4FC985",
      };
    default:
      return {
        Icon: MoreHorizontal,
        backgroundColor: "bg-[#f3f4f6]",
        iconColor: "#6b7280",
      };
  }
};
