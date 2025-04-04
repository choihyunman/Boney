import { api } from "@/lib/api";

export interface child {
    parentChildId: number,
    childId: number,
    childName: string,
    childGender: "MALE" | "FEMALE"
}

export interface children {
    children: child[];
}

export const getChildren = async(): Promise<children> => {
const res = await api.get("parents/quests/children")
    return res.data.data;
}