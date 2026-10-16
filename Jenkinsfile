pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out code from repository...'
                // git 'https://github.com/your-repo/movie-catalog.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker images for backend and frontend...'
                script {
                    docker.image("movie-catalog-backend:latest").build("-f backend/Dockerfile backend")
                    docker.image("movie-catalog-frontend:latest").build("-f frontend/Dockerfile frontend")
                }
            }
        }

        stage('Helm Lint') {
            steps {
                echo 'Validating Helm chart...'
                sh 'helm lint k8s'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying application to Kubernetes via Helm...'
                sh 'helm upgrade --install movie-catalog ./k8s --atomic'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! Application is live.'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}