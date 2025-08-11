import child_female from "@/assets/images/child_female.png";
import child_male from "@/assets/images/child_male.png";
import default_profile from "@/assets/profile/profile.jpg";

export function getChildProfileImage(childGender?: string): any {
  console.log("getChildProfileImage - childGender:", childGender);
  if (childGender === "FEMALE") {
    return child_female; // 여자아이 기본 이미지
  } else if (childGender === "MALE") {
    return child_male; // 남자아이 기본 이미지
  }
  return default_profile; // 기본 이미지
}
