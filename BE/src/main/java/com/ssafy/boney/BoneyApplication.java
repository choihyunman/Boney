package com.ssafy.boney;

import com.ssafy.boney.global.config.ExternalApiProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication()
@EnableScheduling
@EnableConfigurationProperties(ExternalApiProperties.class)
public class BoneyApplication {

	public static void main(String[] args) {
		SpringApplication.run(BoneyApplication.class, args);
	}

}
