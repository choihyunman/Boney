pipeline {
    agent { label 'ec2' }

    environment {
        TZ = 'Asia/Seoul'
    }

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout Source') {
            steps {
                git branch: 'release',
                    url: 'https://lab.ssafy.com/s12-fintech-finance-sub1/S12P21B208.git',
                    credentialsId: 'choihyunman'
            }
        }

         stage('Load .env File') {
            steps {
                 withCredentials([file(credentialsId: 'choi', variable: 'ENV_FILE')]) {
                    sh '''
                    echo "📦 .env 로딩 중..."
                    rm -f .env
                    cp $ENV_FILE .env
                    '''
                }
            }
        }

        stage('Stop Existing Containers') {
            steps {
                sh '''
                docker compose down || true
                docker rm -f frontend || true
                docker rm -f backend || true
                docker rm -f mysql || true
            '''
            }
        }

        stage('Build & Deploy') {
            steps {
                sh 'docker compose build'
                sh 'docker compose up -d'
            }
        }
    }

    post {
        success {
            echo '✅ 배포 성공!'
        }
        failure {
            echo '❌ 배포 실패!'
        }
    }
}