package com.ssafy.boney.global.config;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
@ConfigurationProperties(prefix = "external-api.account-auth")
public class ExternalApiProperties {
    private String url;
    private String institutionCode;
    private String fintechAppNo;
    private String apiServiceCode;
    private String apiKey;
    private String userKey;

    public void setUrl(String url) {
        this.url = url;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
    }

    public void setFintechAppNo(String fintechAppNo) {
        this.fintechAppNo = fintechAppNo;
    }

    public void setApiServiceCode(String apiServiceCode) {
        this.apiServiceCode = apiServiceCode;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public void setUserKey(String userKey) {
        this.userKey = userKey;
    }


}
