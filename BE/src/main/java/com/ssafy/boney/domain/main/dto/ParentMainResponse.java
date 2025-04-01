package com.ssafy.boney.domain.main.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class ParentMainResponse {
    private String parent_name;
    private String account_number;
    private String bank_name;
    private Long account_balance;
    private List<Map<String, Object>> child;
    private List<Map<String, Object>> quest;

    public static ParentMainResponse of(String parentName, String accountNumber, String bankName, Long balance,
                                        List<Map<String, Object>> childList, List<Map<String, Object>> questList) {
        return ParentMainResponse.builder()
                .parent_name(parentName)
                .account_number(accountNumber)
                .bank_name(bankName)
                .account_balance(balance)
                .child(childList)
                .quest(questList)
                .build();
    }


}
