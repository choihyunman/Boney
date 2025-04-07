package com.ssafy.boney.global.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "external-api")
public class ExternalApiProperties {
    private AccountAuth accountAuth;
    private Transaction transaction;

    @Getter
    @Setter
    public static class AccountAuth {
        private String urlOneCoin;
        private String urlOneCoinCheck;
        private String institutionCode;
        private String fintechAppNo;
        private String apiServiceCode;
        private String apiKey;
        private String userKey;
        private String urlAccountCreate;
        private String accountTypeUniqueNo;
        private String urlAccountDeposit;
    }

    @Getter
    @Setter
    public static class Transaction {
        private String url;

    }
}
