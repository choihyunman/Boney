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
ENTRYPOINT ["sh", "-c", "npx expo start --port 8081"]