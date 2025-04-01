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

pipeline {
    agent { label 'ec2' }

    environment {
        TZ = 'Asia/Seoul'
    }

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Check Target Branch') {
            steps {
                script {
                    echo "🔍 현재 브랜치: ${env.gitlabTargetBranch}"
                    if (env.gitlabTargetBranch != 'release') {
                        echo "🚫 release 브랜치가 아니므로 전체 배포 프로세스를 건너뜁니다."
                        return  // 🎯 여기서 조용히 성공 종료
                    }
                }
            }
        }

        stage('Force Fix Permissions Before Clean') {
            steps {
                echo "🔐 deleteDir 전에 퍼미션 강제 수정"
                sh '''
                sudo chown -R ubuntu:ubuntu . || true
                sudo chmod -R u+rwX . || true
                '''
            }
        }

        stage('Clean Workspace') {
            steps {
                echo "🧹 이전 워크스페이스 정리 중..."
                deleteDir()
            }
        }

        stage('Fix Permissions') {
            steps {
                echo "🔧 퍼미션 수정 중..."
                sh 'sudo chown -R ubuntu:ubuntu . || true'
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

        stage('Load 운영용 .env File') {
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

        stage('Run Backend Tests via Docker') {
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

        stage('Stop Test Containers') {
            steps {
                echo "🧹 테스트 컨테이너 정리 중..."
                sh 'docker compose -f docker-compose.test.yml down --remove-orphans || true'
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
                echo "⚙️ 운영용 .env 기반 이미지 빌드 & 컨테이너 실행 중..."
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
