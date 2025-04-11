# 프로젝트 포팅 매뉴얼

## 목차

1. [개요](#1-개요)
2. [시스템 환경](#2-시스템-환경)
3. [빌드 및 배포 가이드](#3-빌드-및-배포-가이드)
4. [리버스 프록시 설정 가이드](#4-리버스-프록시-설정-가이드)
5. [젠킨스 및 깃랩 설정 가이드](#5-데이터베이스-설정-가이드)
6. [APK 배포](#6-데이터베이스-설정-가이드)

## 1. 개요
- 작성일: 2025-4-10
- 작성자: [최현만]

**APK 앱과 별개로 웹 서버에 올라가는 간단한 프론트엔드 화면은 웹 게시용이라고 별도 표시시

### 1. 프로젝트 개요
- 프로젝트명: [boney]
- GitLab 저장소 URL: (https://lab.ssafy.com/s12-fintech-finance-sub1/S12P21B208.git)

## 2. 시스템 환경
### 2.1 개발 환경
#### 2.1.1 IDE
- IntelliJ IDEA 2023.3.8
- Visual Studio Code 1.99.0

#### 2.1.1 런타임 환경
- JDK 17
- Spring Boot 3.3.9
- React Native 0.76.7
- Expo 52.0.39
- Python 3.12.8  

#### 2.1.2 빌드 도구
- 프론트엔드 빌드 도구: Expo, Babel
- 정적타입 언어: TypeScript
- 스타일링 도구: TailwindCSS
- React Native 스타일링 확장: nativewind
-	백앤드 빌드 도구: Gradle
- AI 서버 빌드 도구: pip

### 2.2 서버 환경
#### 2.2.1 인스턴스
- AWS EC2
- S3

#### 2.2.2 기술 스택
- 안드로이드 앱: React Native
- 프론트엔드 서버(앱 다운로드를 위한 웹 게시용): Node.js 22.14, Expo CLI
- 백엔드 서버: Spring boot
- AI 서버: FastAPI
- 프록시 서버 Nginx
- 컨테이너: Docker
- 데이터베이스: MySQL

#### 2.2.3 포트 구성
- 프론트엔드:8081(웹 게시용)
- 백엔드:8080
- DB:3306
- AI:8000
- Proxy:443

#### 2.2.4 MySQL 데이터베이스 접속 설정

```yml

  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://mysql:3306/boney?serverTimezone=UTC&characterEncoding=UTF-8
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}

```

#### 2.2.5 Spring 설정

```yml

server:
  port: 8080

spring:
  application:
    name: boney

  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://mysql:3306/boney?serverTimezone=UTC&characterEncoding=UTF-8
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    
  jpa:
    database-platform: org.hibernate.dialect.MySQLDialect
    hibernate:
      ddl-auto: update  
    properties:
      hibernate:
        show_sql: true
        format_sql: true
        use_sql_comments: true 
        dialect: org.hibernate.dialect.MySQLDialect

  security:
    oauth2:
      client:
        provider:
          kakao:
            authorization-uri: https://kauth.kakao.com/oauth/authorize
            token-uri: https://kauth.kakao.com/oauth/token
            user-info-uri: https://kapi.kakao.com/v2/user/me
            user-name-attribute: id
        registration:
          kakao:
            client-id: ${CLIENT_ID}
            client-secret: ${CLIENT_SECRET}
            redirect-uri: ${REDIRECT_URI}
            authorization-grant-type: authorization_code
            client-authentication-method: POST
            client-name: kakao
            scope:
              - account_email

jwt:
  secret: ${JWT_SECRET}

external-api:
  account-auth:
    url-one-coin: "https://finopenapi.ssafy.io/ssafy/api/v1/edu/accountAuth/openAccountAuth"
    url-one-coin-check: "https://finopenapi.ssafy.io/ssafy/api/v1/edu/accountAuth/checkAuthCode"
    url-account-create: "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/createDemandDepositAccount"
    url-account-deposit: "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/updateDemandDepositAccountDeposit"
    base-url: "https://finopenapi.ssafy.io/ssafy/api/v1/edu"
    institution-code: "00100"
    fintech-app-no: "001"
    api-service-code: "openAccountAuth"
    api-key: ${SSAFY_API_KEY}
    user-key: ${SSAFY_USER_KEY}
    account-type-unique-no: ${SSAFY_UNIQUE_KEY}
  transaction:
    url: "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireTransactionHistoryList"

fastapi:
  url: ${FASTAPI_URL}

cloud:
  aws:
    credentials:
      access-key: ${AWS_ACCESS_KEY}
      secret-key: ${AWS_SECRET_KEY}
    region:
      static: ${AWS_REGION}
    s3:
      bucket: ${S3_BUCKET_NAME}

firebase:
  service-account-file: ${FIRBASE_SERVICE_ACCOUNT}

kakao:
  admin-key: ${KAKAO_ADMIN_KEY}
  logout-redirect-uri: ${KAKAO_LOGOUT_REDIRECT_URL}

```

#### 2.2.6 환경변수 설정

아래 env 파일에는 실제 키를 입력해줘야 한다.

```.env

API_URL=YOUR_API_URL
COMPOSE_PROJECT_NAME=YOUR_COMPOSE_PROJECT_NAME
MYSQL_ROOT_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
MYSQL_DATABASE=YOUR_MYSQL_DATABASE
MYSQL_USER=YOUR_MYSQL_USER
MYSQL_PASSWORD=YOUR_MYSQL_PASSWORD
SPRING_DATASOURCE_URL=YOUR_SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME=YOUR_SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD=YOUR_SPRING_DATASOURCE_PASSWORD
AWS_REGION=YOUR_AWS_REGION
S3_BUCKET_NAME=YOUR_S3_BUCKET_NAME
AWS_ACCESS_KEY=YOUR_AWS_ACCESS_KEY
AWS_SECRET_KEY=YOUR_AWS_SECRET_KEY
JWT_SECRET=HFwodSBtld8oN1DAfp1ngP6NAwvQkHYCbLpaA79yPKo=YOUR_JWT_SECRET

CLIENT_ID=YOUR_CLIENT_ID
CLIENT_SECRET=YOUR_CLIENT_ID
REDIRECT_URI=YOUR_REDIRECT_URI
SSAFY_API_KEY=YOUR_SSAFY_API_KEY
SSAFY_USER_KEY=YOUR_SSAFY_USER_KEY
SSAFY_UNIQUE_KEY=YOUR_SSAFY_UNIQUE_KEY
FASTAPI_URL=YOUR_FASTAPI_URL
FIRBASE_SERVICE_ACCOUNT=YOUR_FIRBASE_SERVICE_ACCOUNT
KAKAO_ADMIN_KEY=YOURKAKAO_ADMIN_KEY
KAKAO_LOGOUT_REDIRECT_URL=YOUR_KAKAO_LOGOUT_REDIRECT_URL

serverTimezone=Asia/Seoul

```

#### 2.2.7 테스트용 백앤드 yml 파일 및 환경변수

자동 배포 전 테스트 위한 설정. 테스트는 별도의 데이터베이스에서 더미 데이터를 넣고 백앤드와 JPA가 연동되는지 확인하도록 구성. 테스트가 성공적으로 끝나야 배포 되도록. 테스트 시작 전에 해당 DB에서 데이터 자동 삭제토록 설정. application-test.yml도 따로 구성. mysql_test:3306 이런 식으로 컨테이너 이름 꼭 test용으로 명시. 테스트인 만큼 jpa ddl-auto 설정은 create-drop으로 구성해 테스트 종료 후 자동 삭제되도록.

```yml
spring:
  datasource:
    url: jdbc:mysql://mysql_test:3306/boney_test?useSSL=false&allowPublicKeyRetrieval=true&characterEncoding=UTF-8&serverTimezone=Asia/Seoul
    username: ${MYSQL_USER}
    password: ${MYSQL_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: create-drop
    properties:
      hibernate:
        format_sql: true
        show_sql: true

  sql:
    init:
      mode: never

```

```env.test

COMPOSE_PROJECT_NAME=YOUR_COMPOSE_PROJECT_NAME
MYSQL_ROOT_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
MYSQL_DATABASE=YOUR_MYSQL_DATABASE
MYSQL_USER=YOUR_MYSQL_USER
MYSQL_PASSWORD=YOUR_MYSQL_PASSWORD
SPRING_DATASOURCE_URL=YOUR_SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME=YOUR_SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD=YOUR_SPRING_DATASOURCE_PASSWORD
AWS_REGION=YOUR_AWS_REGION
S3_BUCKET_NAME=YOUR_S3_BUCKET_NAME
AWS_ACCESS_KEY=YOUR_AWS_ACCESS_KEY
AWS_SECRET_KEY=YOUR_AWS_SECRET_KEY

SPRING_PROFILES_ACTIVE=YOUR_SPRING_PROFILES_ACTIVE

```

## 3. 빌드 및 배포 가이드

### 3.1 업데이트 패키지 확인 및 설치
```bash
$ sudo apt update && sudo apt upgrade -y
```
### 3.2 도커 설치
#### 3.2.1 필요한 패키지 설치
```bash
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
```

#### 3.2.2 Docker 공식 GPG 키를 추가
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

#### 3.2.3 Docker 저장소 추가
```bash
$ sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
```

#### 3.2.4 패키지 목록 재업데이트 
```bash
sudo apt update && sudo apt upgrade -y
```

#### 3.2.5 Docker 설치
```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

#### 3.2.6 도커 설치 확인
```bash
$ docker --version
```

#### 3.2.7 Docker를 사용 시 sudo 명령 없이 편하게 사용하기 위한 설정
```bash
sudo usermod -aG docker $USER
```

#### 3.2.8 Docker Compose 설치
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

### 3.3 배포용 docker-compose 작성
- docker-compose.yml
```yml

services:
  frontend:                       #웹 게시용
    build: ./FE                   #FE 디렉토리의 Dockerfile로 빌드
    container_name: frontend      
    expose:                     #배포용: 컨테이너 간 통신 시 내부 포트 노출
      - "8081"
#    ports:                        #개발용: 로컬 PC에서 접근 가능하도록
#      - "8081:8081"
    volumes:
      - ./FE:/FE                  # 소스코드를 컨테이너로 마운트(실시간 반영)
      - /FE/node_modules          # node_modules 폴더 따로 관리용 볼륨
    networks:
      - app_network
    restart: always
    environment:
      - TZ=Asia/Seoul
    # healthcheck:                # 헬스체크(컨테이너 정상작동 확인용) 필요시 포함. *컨테이너 내부 실행이라 로컬호스트
    #   test: ["CMD-SHELL", "curl -f http://localhost:8081 || exit 1"]
    #   interval: 60s  # 60초마다 체크
    #   retries: 5      # 5번까지 재시도
    #   timeout: 20s    # 20초 내 응답 없으면 실패

  backend:
    build: ./BE
    container_name: backend
    expose:
       - "8080"
#    ports:
#      - "8080:8080"
    depends_on:
      mysql:
        condition: service_started
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/${MYSQL_DATABASE}?useSSL=false&allowPublicKeyRetrieval=true&characterEncoding=UTF-8&serverTimezone=Asia/Seoul
      TZ: Asia/Seoul
      JAVA_SECURITY_PROPERTIES: |
        jdk.internal.reflect.permitAll=true
        jdk.reflect.allowNativeAccess=true
    env_file:
      - .env                      # 환경변수 따로 .env 파일로 관리
    ulimits:
      nofile:                     # 많은 사용자 요청 대비 최대 파일 디스크립터 수 높게 설정
        soft: 65536                
        hard: 65536
    networks:
      - app_network
    restart: always
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
  
  ai:
    build: ./AI
    container_name: ai
    expose:
      - "8000"
    #ports:
    #  - "8000:8000"
    volumes:
      - ./AI:/AI
    environment:
      - PYTHONPATH=/AI
      - TZ=Asia/Seoul
    networks:
      - app_network
    restart: always
          
  mysql:
    build: 
      context: ./mysql
    container_name: mysql
    # ports:
    # - "3306:3306"
    expose:
      - "3306"
    env_file:
      - .env
    environment:
      TZ: Asia/Seoul                # 타임존 설정
      MYSQL_INIT_COMMAND: "SET GLOBAL host_cache_size=0"
    volumes:
      - mysql_data:/var/lib/mysql   # MySQL 데이터 영속화 (컨테이너 삭제 시에도 데이터 보존)
    networks:
      - app_network
    restart: always
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

volumes:                            #named volume 명시적으로 선언.(안 하면 예기치 않는 문제 발생 가능)
  mysql_data:

networks:
  app_network:
    external: true

```

- docker-compose.nginx.yml

```yml

services:
  nginx:
    image: nginx:alpine
    container_name: nginx
    ports:
      - "80:80"                     # HTTP 포트
      - "443:443"                   # HTTPS 포트
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro #  로컬의 Nginx 메인 설정 파일을 컨테이너 내부의 /etc/nginx/nginx.conf에 연결 (읽기 전용-안정성 확보 차원)
      - ./nginx/conf.d:/etc/nginx/conf.d:rw  # 사이트별 설정 파일 (읽기/쓰기 가능, 배포 시 핫리로드 목적)
      - /etc/letsencrypt:/etc/letsencrypt:ro  # Let's Encrypt 인증서 경로 마운트 (읽기 전용)
      - /etc/ssl/certs:/etc/ssl/certs:ro  # 시스템 SSL 인증서 디렉토리 마운트 (읽기 전용)
      - /etc/nginx/sites-available:/etc/nginx/sites-available:ro  # 사용 가능한 사이트 설정 모음 디렉토리 (읽기 전용)
      - /var/log/nginx:/var/log/nginx # Nginx 로그 저장 디렉토리 마운트 (읽기/쓰기)
      - ./nginx/html:/usr/share/nginx/html:ro # 정적 웹 파일 경로 (예: index.html 등, 읽기 전용)
    networks:
      - app_network
    restart: always
    environment:
      TZ: Asia/Seoul

networks:
  app_network:
    external: true

```

- docker-compose.jenkins.yml

```yml

services:
  jenkins:
    image: jenkins/jenkins:lts-jdk17
    user: root
    container_name: jenkins
    expose:
      - "8080"
    volumes:
      - ./jenkins_home:/var/jenkins_home:rw
      - /usr/local/bin/docker-compose:/usr/local/bin/docker-compose
    networks:
      - app_network
    restart: unless-stopped
    environment:
      TZ: Asia/Seoul
      JENKINS_OPTS: "--httpPort=8080 --prefix=/jenkins" #Jenkins를 도메인 루트가 아닌 /jenkins 하위 경로에서 실행하도록 설정
      
networks:
  app_network:
    external: true

```

### 3.4 테스트용 docker-compose 작성

docker-compose.test(젠킨스 파트에서 추가 설명) 

```yml

services:
  mysql_test:
    build: 
      context: ./mysql
      dockerfile: Dockerfile.test
    container_name: mysql_test
    expose:
      - "3306"
    env_file:
      - .env.test                   #Database 이름 등이 겹쳐서 오류나지 않도록 운영용 env파일이 아닌 테스트용 env 파일 사용. 격리 환경에서 테스트 위함 
    environment:
      TZ: Asia/Seoul
      MYSQL_INIT_COMMAND: "SET GLOBAL host_cache_size=0"
    volumes:
      - type: tmpfs
        target: /var/lib/mysql      # 메모리에서만 동작, 재시작 시 데이터 없어짐. 테스트인 점을 고려.
    networks:
      - app_network
    restart: always
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 3s
      retries: 10

  backend_test:
    build:
      context: ./BE
      dockerfile: Dockerfile.test
    container_name: backend_test
    expose:
      - "8080"
    depends_on:
      mysql_test:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql_test:3306/${MYSQL_DATABASE}?useSSL=false&allowPublicKeyRetrieval=true&characterEncoding=UTF-8&serverTimezone=Asia/Seoul
      TZ: Asia/Seoul
    env_file:
      - .env.test
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
    networks:
      - app_network
    restart: no
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

networks:
  app_network:
    external: true

```
### 3.5 (참고) 자바 및 mysql 테스트 파일 첨부

```java

package com.ssafy.boney.domain.user;

import com.ssafy.boney.domain.user.entity.User;
import com.ssafy.boney.domain.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlGroup;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")             //.env.test에 SPRING_PROFILES_ACTIVE=test 삽입해야 동작
@Transactional
@Rollback
@SqlGroup({
    @Sql(scripts = "classpath:/sql/truncate-all.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD),
    @Sql(scripts = "classpath:/sql/test-init.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD) //sql 파일 위치 명시적으로 지정 안 하면 에러 발생 가능성 존재
})
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void 카카오ID로_회원조회_성공() {
        // given
        Long kakaoId = 2000000000001L;

        // when
        Optional<User> userOpt = userRepository.findByKakaoId(kakaoId);

        // then
        assertTrue(userOpt.isPresent());
        assertEquals("김서준", userOpt.get().getUserName());
    }
}

```

test-init.sql

```sql

INSERT INTO user (
  user_email, user_birth, user_phone, user_name,
  role, kakao_id, user_gender, created_at
) VALUES (
  'child01@example.com', '2012-01-10', '010-2000-0001', '김서준',
  'CHILD', 2000000000001, 'MALE', NOW()
);

```

truncate-all.sql

```sql

SET FOREIGN_KEY_CHECKS = 0;           --데이터 지우기 위한 외래키 해제
TRUNCATE TABLE user;                  --테스트 실행 전 테스트용 DB 비우기
SET FOREIGN_KEY_CHECKS = 1;           --외래키 설정

```

### 3.5 배포용 도커 파일
#### 3.5.1 프론트엔드(웹에 APK 링크 게시용)

```Dockerfile

# Node.js 22.14 (Alpine) 기반 이미지 사용
FROM node:22.14-alpine

# 작업 디렉토리 설정
WORKDIR /FE

# 필수 패키지 설치
RUN apk add --no-cache git bash curl

# package.json & lock 파일 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm install

# Expo 관련 패키지 추가 설치
RUN npm install -g @expo/ngrok

# 전체 프로젝트 복사
COPY . .

# Expo 개발 서버 포트 노출
EXPOSE 8081

# Expo 실행 명령어 수정 (터미널 입력 필요 없도록 `--tunnel` 제거)
ENTRYPOINT ["sh", "-c", "npx expo start --web --port 8081 --host lan"]


```

#### 3.5.2 백엔드

```Dockerfile

# 빌드 스테이지
FROM gradle:8.12.1-jdk17 AS build

WORKDIR /home/gradle/src

COPY --chown=gradle:gradle . .

RUN gradle build -x test --no-daemon

# 실행 스테이지
FROM openjdk:17-jdk

WORKDIR /app

# 빌드 스테이지에서 생성된 JAR 파일을 복사
COPY --from=build /home/gradle/src/build/libs/*.jar app.jar

EXPOSE 8080

# 자바 보안 해제
ENV JAVA_OPTS="\
    --add-opens=java.base/sun.nio.ch=ALL-UNNAMED \
    --add-opens=java.base/java.lang=ALL-UNNAMED \
    --add-opens=java.base/java.lang.reflect=ALL-UNNAMED \
    --add-opens=java.base/java.io=ALL-UNNAMED \
    --add-opens=java.base/java.nio=ALL-UNNAMED \
    --add-opens=java.base/java.util=ALL-UNNAMED \
    --add-opens=java.base/java.util.concurrent=ALL-UNNAMED \
    --add-opens=java.base/java.net=ALL-UNNAMED \
    --add-opens=java.base/jdk.internal.misc=ALL-UNNAMED \
    -Djava.security.egd=file:/dev/./urandom"

# Java 17의 접근 제한 문제 해결을 위한 옵션 추가
CMD java $JAVA_OPTS -jar app.jar


```

#### 3.5.3 AI

```Dockerfile

# Python 3.12.8 기반 이미지
FROM python:3.12.8-slim

# 작업 디렉터리 설정
WORKDIR /AI

# 시스템 타임존 설정
ENV TZ=Asia/Seoul

# 필요한 시스템 패키지 설치 (예: tzdata, curl 등)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tzdata curl && \
    rm -rf /var/lib/apt/lists/*

# tzdata 설정 (비상호작용)
RUN ln -fs /usr/share/zoneinfo/Asia/Seoul /etc/localtime && dpkg-reconfigure -f noninteractive tzdata

# 의존성 복사 및 설치
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# uvicorn 실행 (8000 포트)
CMD ["uvicorn", "fds:app", "--host", "0.0.0.0", "--port", "8000"]

```

#### 3.5.4 MySQL

```Dockerfile

FROM mysql:8.0.41

ENV TZ=Asia/Seoul

# 커스텀 MySQL 설정 파일을 컨테이너에 복사
COPY mysql.cnf /etc/mysql/conf.d/custom.cnf

# 초기화 SQL 스크립트를 도커 엔트리포인트 초기화 디렉토리에 복사
COPY init/ /docker-entrypoint-initdb.d/

EXPOSE 3306

```

#### 3.5.5 Nginx

```Dockerfile

# Alpine 기반의 경량화된 Nginx 이미지 사용
FROM nginx:alpine

# Nginx 설정 파일이 위치한 디렉토리로 작업 디렉토리 변경
WORKDIR /etc/nginx

# 현재 디렉토리의 모든 파일을 Nginx 설정 디렉토리로 복사
COPY . /etc/nginx/

```

### 3.6 테스트용 도커 파일

젠킨스로 배포 시 테스트를 거치도록 파이프라인 구성. 테스트용이니 만큼 도커파일을 간단하게 구성

#### 3.6.1 백엔드

```Dockerfile

# Dockerfile.test
FROM gradle:8.12.1-jdk17

WORKDIR /app

COPY --chown=gradle:gradle . .

RUN gradle build -x test --no-daemon

CMD ["gradle", "test", "--no-daemon"]


```

#### 3.6.2 MYSQL

```Dockerfile

FROM mysql:8.0.41

ENV TZ=Asia/Seoul

COPY mysql.cnf /etc/mysql/conf.d/custom.cnf


```

## 4. 리버시 프록시 설정 가이드
### 4.1 인증서 설정
#### 4.1.1 certbot 기본 패키지 설치
```bash
$ sudo apt install certbot
```

#### 4.1.2 Nginx 플러그인 설치
```bash
$ sudo apt install python3-certbot-nginx
```

#### 4.1.3 Certbot으로 SSL/TLS 인증서 발급
```bash
$ sudo certbot -d j12b208.p.ssafy.io
```

#### 4.1.4 Certbot으로 발급된 SSL/TLS 인증서 목록 확인
```bash
$ sudo certbot certificates
```

### 4.2 nginx 기본 설정
```conf
# nginx/nginx.conf
# nginx 실행 사용자 지정
user nginx;
# CPU 코어 수에 맞게 워커 프로세스 자동 설정
worker_processes auto;
# nginx 마스터 프로세스 ID 저장 위치
pid /run/nginx.pid;

events {
    # 워커 프로세스당 최대 동시 접속 수 설정
    worker_connections 768;
}

http {
    # 정적 파일 전송 최적화 설정
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    # 접속 유지 시간 설정 (65초)
    keepalive_timeout 65;
    # MIME 타입 해시 테이블 크기 설정
    types_hash_max_size 2048;

    # MIME 타입 설정 파일 포함
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # SSL 프로토콜 버전 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # 로그 파일 위치 설정
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # gzip 압축 사용
    gzip on;

    # 추가 설정 파일 포함
    include /etc/nginx/conf.d/*.conf;
}
```

### 4.3 nginx 확장 설정
```conf

# Docker 컨테이너 내부에서 DNS 이름을 해석하기 위한 설정
resolver 127.0.0.11 valid=30s;  # Docker의 내부 DNS 서버

# ========================
# Upstream 서버 정의
# ========================

# 프론트엔드 컨테이너 (React/Expo 등, 웹 게시용)
upstream frontend { 
    zone upstream_frontend 64k;
    server frontend:8081 resolve;  # docker-compose로 실행된 컨테이너명 기준
}

# 백엔드 컨테이너 (Spring Boot)
upstream backend {
    zone upstream_backend 64k;
    server backend:8080 resolve;
}

# 젠킨스 (CI/CD)
upstream jenkins {
    zone upstream_jenkins 64k;
    server jenkins:8080 resolve;
}

# AI 서버 (FastAPI)
upstream ai {
    zone upstream_ai 64k;
    server ai:8000 resolve;
}

# ========================
# HTTP → HTTPS 리다이렉트
# ========================

server {
    listen 80;
    server_name j12b208.p.ssafy.io;

    # http 요청을 https로 영구 리다이렉트
    return 301 https://$server_name$request_uri;
}

# ========================
# HTTPS 메인 서버 설정
# ========================

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name j12b208.p.ssafy.io;

    # SSL 인증서 설정 (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/j12b208.p.ssafy.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/j12b208.p.ssafy.io/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # 모든 프록시 요청에 공통적으로 전달되는 헤더 (클라이언트 정보 보존)
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # ========================
    # 프론트엔드 요청 처리
    # ========================
    location / {
        proxy_pass http://frontend/;

        # WebSocket 및 HTTP/1.1 업그레이드
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 추가 헤더들
        proxy_http_version 1.1;
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;

        # 에러 발생 시 유지보수 페이지로 연결
        error_page 502 503 504 = @maintenance;
    }

    # ========================
    # 백엔드 REST API 라우팅
    # ========================
    location /api/v1/ {
        proxy_pass http://backend/api/v1/;
        proxy_intercept_errors on;
        error_page 503 = @maintenance;
    }

    # ========================
    # 젠킨스 접근
    # ========================
    location /jenkins {
        proxy_pass http://jenkins;
        proxy_read_timeout 9000;
        proxy_intercept_errors on;
        error_page 503 = @maintenance;

        # HTTPS 환경에서 젠킨스와 연동을 위한 헤더들
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;

        # 젠킨스 WebSocket 지원 설정
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # http → https 리디렉션 보정
        proxy_redirect http:// https://;
    }

    # ========================
    # AI API 라우팅
    # ========================
    location /api/ai {
        proxy_pass http://ai/api/ai;
        proxy_intercept_errors on;
        error_page 503 = @maintenance;
    }

    # ========================
    # 유지보수 페이지 설정
    # ========================
    location @maintenance {
        root /usr/share/nginx/html;
        try_files /maintenance.html =503;  # maintenance.html 파일을 반환
    }
}

```

## 5. 젠킨스 및 깃랩 설정 가이드
### 5.1 job 만들기

새로운 item 만들기 누른 뒤 New Item에 프로젝트 이름을 넣고 Pipeline을 클릭해서 만듬. 가장 많이 쓰는 Jenkins Job 타입. 여러 OS나 브라우저 등을 조합해 테스트하려면 Multi-configuration project를, GitLab/GitHub에서 브렌치별 빌드 필요하면 Multibranch Pipeline 선택.

### 5.2 젠킨스 기본 설정

먼저 젠킨스 관리-> 플러그인 관리 -> GitLab Plugin 설치돼야 함. System 들어가서 Gitlab에서 Connetion name, Gitlab host URL 작성. credentials 들어가서 Gitlab API token 추가. 참고로 Gitlab API token 만들 때 API token 항목에는 Gitlab에서 발급받은 access token을 넣어줘야 한다. Test Connection으로 테스트 해보고 왼쪽에 Success 나오는지 확인.

젠킨스 agent가 동작하도록 하기 위해 EC2 SSH Key도 credential에 등록해줘야 한다. (다만 도커 아웃 오브 도커, 즉 DOOD 방식으로 젠킨스 도커를 올릴 때 docker.sock 설정을 해서 도커 데몬을 공유하도록 하면 굳이 등록하지 않아도 괜찮다. 사실 DOOD 방식으로 하는 게 실무에서 많이 쓰이는 방식이지만 SSH Key를 설정해주는 EC2 Agent 방식이 에이전트별 권한 제어가 가능하고 소켓 노출이 없어서 보안에 유리해서 장기적으로 좋다는 말에 EC2 Agent 방식을 사용)

Username에 ubuntu 입력. EC2 인스턴스에 실제로 SSH 접속할 수 있는 정확한 사용자 이름 입력해야 함.

Private Key에는 .pem 파일 내용 전체 붙여넣기. 참고로 -----BEGIN RSA PRIVATE KEY-----, -----END RSA PRIVATE KEY-----도 함께 붙여넣어야 한다.

### 5.3 깃랩 설정

깃랩 Settings에 들어가서 Webhook 설정. Secret token 설정이 있는데, 이건 젠킨스에서 구성(Configure)-> General -> 고급에 들어가서 발급받은 Secret token 키를 넣어주면 된다.

### 5.4 메타모스트 설정

메타모스트에서 Integrations -> Incoming Webhooks -> Add Incoming Webhook -> 채널 선택 + 이름 입력 -> Webhook URL 복사

젠킨스 Credential에 Webhook 등록. Secret에 복사한 Webhook URL 넣는다.

### 5.4 추가 Credentials 설정

특정 브렌치를 깃 클론해서 실행할 때 .env 파일을 추가로 설정해둬야 한다. 깃 클론된 파일에는 .env 파일이 없기 때문. application.yml 파일도 마찬가지. firebase key도 등록한다.

### 5.5 젠킨스 파일 스크립트

```groovy

//메타모스트 훅 등록
def notifyMattermost(message, success = true) {
    def color = success ? "#00c853" : "#d50000"
    withCredentials([string(credentialsId: 'mattermost-webhook', variable: 'WEBHOOK_URL')]) {
        sh """
        curl -X POST -H 'Content-Type: application/json' \
        -d '{
            "username": "Jenkins Bot",
            "icon_emoji": ":rocket:",
            "attachments": [{
                "fallback": "${message}",
                "color": "${color}",
                "text": "${message}"
            }]
        }' $WEBHOOK_URL
        """
    }
}

pipeline {
    //ec2 agent 실행
    agent { label 'ec2' }

    environment {
        TZ = 'Asia/Seoul'
    }

    options {
        skipDefaultCheckout(true)
    }

    stages {
        //release 브렌치가 대상일 경우만 배포 프로세스가 작동되도록 설정. release 브렌치가 대상이 아니면 메타모스트에 따로 배포 건너뛴다는 알림 오도록 설정정
        stage('Check Target Branch') {
            steps {
                script {
                    echo "🔍 현재 브랜치: ${env.gitlabTargetBranch}"
                    if (env.gitlabTargetBranch != 'release') {
                        echo "🚫 release 브랜치가 아니므로 전체 배포 프로세스를 건너뜁니다."
                        notifyMattermost("⚠️ *배포 건너뜀!* `${env.gitlabTargetBranch}` 브랜치는 배포 대상이 아닙니다.", true)
                        return
                    }
                }
            }
        }

        //기존에 깃 클론됐던 워크스페이스 비우기 위해 퍼미션 강제 수정. 예를 들어서 expo 파일 폴더 등은 루트 권한으로 생성돼서 젠킨스가 삭제할 수 없음.
        stage('Force Fix Permissions Before Clean') {
            when {
                expression { env.gitlabTargetBranch == 'release' }
            }
            steps {
                echo "🔐 deleteDir 전에 퍼미션 강제 수정"
                sh '''
                sudo chown -R ubuntu:ubuntu . || true
                sudo chmod -R u+rwX . || true
                '''
            }
        }
        
        //이전의 워크스페이스 정리
        stage('Clean Workspace') {
            when {
                expression { env.gitlabTargetBranch == 'release' }
            }
            steps {
                echo "🧹 이전 워크스페이스 정리 중..."
                deleteDir()
            }
        }
      
        //워크스페이스에 깃 클론
        stage('Checkout Source') {
            when {
                expression { env.gitlabTargetBranch == 'release' }
            }
            steps {
                echo "📦 Git 리포지토리 클론 중..."
                git branch: 'release',
                    url: 'https://lab.ssafy.com/s12-fintech-finance-sub1/S12P21B208.git',
                    credentialsId: 'choihyunman'
            }
        }
        
        //.env 파일 불러오기
        stage('Load 운영용 .env File') {
            when {
                expression { env.gitlabTargetBranch == 'release' }
            }
            steps {
                echo "🔐 운영용 .env 파일 로딩 중..."
                withCredentials([file(credentialsId: 'choi', variable: 'ENV_FILE')]) {
                    sh '''
                    rm -f .env
                    cp $ENV_FILE .env
                    '''
                }
            }
        }

        //application.yml 불러오기
        stage('Copy application.yml') {
            when {
                expression { env.gitlabTargetBranch == 'release' }
            }
            steps {
                echo "📄 application.yml 복사 중..."
                withCredentials([file(credentialsId: 'app-yml', variable: 'APP_YML')]) {
                    sh '''
                    mkdir -p BE/src/main/resources
                    cp $APP_YML BE/src/main/resources/application.yml
                    '''
                }
            }
        }

        //Firebase Key 불러오기
        stage('Copy Firebase Key') {
            when {
                expression { env.gitlabTargetBranch == 'release' }
            }
            steps {
                echo "🔑 Firebase serviceAccountKey 복사 중..."
                withCredentials([file(credentialsId: 'firebase-key', variable: 'FIREBASE_KEY')]) {
                    sh '''
                    mkdir -p BE/src/main/resources/firebase
                    cp $FIREBASE_KEY BE/src/main/resources/firebase/serviceAccountKey.json
                    '''
                }
            }
        }

        //테스트를 위한 application-test.yml 불러오기
        stage('Copy application-test.yml') {
            when {
                expression { env.gitlabTargetBranch == 'release' }
            }
            steps {
                echo "🧪 application-test.yml 복사 중..."
                withCredentials([file(credentialsId: 'app-test-yml', variable: 'APP_TEST_YML')]) {
                    sh '''
                    mkdir -p BE/src/test/resources
                    cp $APP_TEST_YML BE/src/test/resources/application-test.yml
                    '''
                }
            }
        }

        //기존 .env 파일을 백업해두고 일단 .env.test 파일을 가져옴. application.yml, application-test.yml 파일은 경로로 구분되지만 .env과 .env.test 파일은 같은 경로에 있기 때문에 자동으로 docker-compose 파일이 자동으로 .env 파일을 읽으면서 충돌이 발생할 가능성이 있음. .env 파일 등록 후 테스트 실행
        stage('Run Backend Tests via Docker') {
            when {
                expression { env.gitlabTargetBranch == 'release' }
            }
            steps {
                echo "🧪 테스트용 .env.test 주입 + 테스트 컨테이너 실행 중..."
                withCredentials([file(credentialsId: 'choi-test', variable: 'TEST_ENV_FILE')]) {
                    sh '''
                    echo "📄 기존 .env 백업..."
                    cp .env .env.bak || true

                    echo "🧪 .env.test 덮어쓰기..."
                    rm -f .env.test
                    cp $TEST_ENV_FILE .env.test

                    echo "🐳 테스트 실행..."
                    docker compose -f docker-compose.test.yml up --build --abort-on-container-exit

                    echo "♻️ 테스트 완료, .env 복구..."
                    mv .env.bak .env || true
                    '''
                }
            }
        }

        //테스트 완료 후 테스트 컨테이너 정리리
        stage('Stop Test Containers') {
            when {
                expression { env.gitlabTargetBranch == 'release' }
            }
            steps {
                echo "🧹 테스트 컨테이너 정리 중..."
                sh 'docker compose -f docker-compose.test.yml down --remove-orphans || true'
            }
        }

        //기존 컨테이너 중지 및 삭제
        stage('Stop Existing Containers') {
            when {
                expression { env.gitlabTargetBranch == 'release' }
            }
            steps {
                echo "🛑 기존 컨테이너 중지 및 삭제 중..."
                sh '''
                docker compose down --remove-orphans || true
                docker rm -f frontend || true
                docker rm -f backend || true
                docker rm -f mysql || true
                '''
            }
        }

        //배포
        stage('Build & Deploy') {
            when {
                expression { env.gitlabTargetBranch == 'release' }
            }
            steps {
                echo "⚙️ 운영용 .env 기반 이미지 빌드 & 컨테이너 실행 중..."
                sh 'docker compose build'
                sh 'docker compose up -d'
            }
        }
    }

    //배포 성공 여부에 따라서 Mattamost 알림 오도록 설정
    post {
        success {
            script {
                if (env.gitlabTargetBranch == 'release') {
                    echo '✅ 배포 성공!'
                    notifyMattermost("✅ *배포 성공!* `release` 브랜치 기준 자동 배포 완료되었습니다. 🎉", true)
                }
            }
        }
        failure {
            script {
                if (env.gitlabTargetBranch == 'release') {
                    echo '❌ 배포 실패!'
                    notifyMattermost("❌ *배포 실패!* `release` 브랜치 기준 자동 배포에 실패했습니다. 🔥", false)
                }
            }
        }
    }
}

```

## 6. APK 배포

expo를 이용해 배포. "android" 안에 name에 앱 이름으로 쓰기 위한 '버니' 입력.

아래는 app.json

```json
{
  "expo": {
    "name": "버니",
    "slug": "FE",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icons/full-logo.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "jsEngine": "hermes",
    "splash": {
      "image": "./assets/icons/icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "package": "com.boney.FE",
      "name": "버니",
      "adaptiveIcon": {
        "foregroundImage": "./assets/icons/icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/icons/logo.png"
    },
    "plugins": ["expo-router", "expo-secure-store"],
    "experiments": {
      "router": true,
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "dc60c654-9c90-4e59-8d53-04220cd91abe"
      }
    },
    "owner": "choihyunman"
  }
}
```

아래는 ease.json

apk 배포를 위한 설정.

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

빌드 명령어

```bash

eas build --platform android

```

빌드 이후에 배포해 사용하면 된다.