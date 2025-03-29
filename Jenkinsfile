pipeline {
    agent { label 'ec2' }

    environment {
        TZ = 'Asia/Seoul'
    }

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Fix Permissions') {
            steps {
                sh 'sudo chown -R ubuntu:ubuntu $WORKSPACE || true'
            }
        }

        stage('Checkout Source') {
            steps {
                echo "📦 Git 리포지토리 클론 중..."
                git branch: 'release',
                    url: 'https://lab.ssafy.com/s12-fintech-finance-sub1/S12P21B208.git',
                    credentialsId: 'choihyunman'
            }
        }

        stage('Load .env File') {
            steps {
                echo "🔐 .env 파일 로딩 중..."
                withCredentials([file(credentialsId: 'choi', variable: 'ENV_FILE')]) {
                    sh '''
                    rm -f .env
                    cp $ENV_FILE .env
                    '''
                }
            }
        }

        stage('Copy application.yml') {
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

        stage('Copy application-test.yml') {
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

        stage('Run JPA Tests') {
            steps {
                dir('BE') {
                    echo "✅ 테스트 코드 실행 중..."
                    sh './gradlew clean test --no-daemon'
                }
            }
        }

        stage('Stop Existing Containers') {
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

        stage('Build & Deploy') {
            steps {
                echo "⚙️ 이미지 빌드 & 컨테이너 실행 중..."
                sh 'docker compose build'
                sh 'docker compose up -d'
            }
        }
    }

    post {
        success {
            echo '✅ 배포 성공!'
            notifyMattermost(true)
        }
        failure {
            echo '❌ 배포 실패!'
            notifyMattermost(false)
        }
    }
}

def notifyMattermost(success) {
    def color = success ? "#00c853" : "#d50000"
    def msg = success ? "✅ *배포 성공!* `release` 브랜치 기준 자동 배포 완료되었습니다. 🎉" :
                        "❌ *배포 실패!* `release` 브랜치 기준 자동 배포에 실패했습니다. 🔥"

    withCredentials([string(credentialsId: 'mattermost-webhook', variable: 'WEBHOOK_URL')]) {
        sh """
        curl -X POST -H 'Content-Type: application/json' \
        -d '{
            "username": "Jenkins Bot",
            "icon_emoji": ":rocket:",
            "attachments": [{
                "fallback": "${msg}",
                "color": "${color}",
                "text": "${msg}"
            }]
        }' $WEBHOOK_URL
        """
    }
}