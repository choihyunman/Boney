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
