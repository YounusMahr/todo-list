#!/bin/bash

# ==============================================================================
# TaskSphere Manual Deployment Script
# Use this script on your EC2 instance or local machine to manually build, 
# tag, push your Docker images to ECR, and update ECS.
# ==============================================================================

# Exit immediately if any command fails
set -e

# --- Configuration variables (Modify these to match your AWS environment) ---
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="404459111172" # Updated to your actual AWS Account ID
IMAGE_TAG="latest"            

# Set the backend URL for the client.
# - If you deploy on different IPs (e.g. client on http://3.236.237.226/ and server on http://44.205.15.80:5000/)
#   set this to the absolute backend URL: "http://44.205.15.80:5000/api"
# - If you deploy behind an ALB routing both under the same domain, keep this as "/api"
CLIENT_API_URL="http://44.205.15.80:5000/api"

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECR_REPO_SERVER="todo-list-server"  # Updated to your actual ECR Repo
ECR_REPO_CLIENT="todo-list-client"  # Updated to your actual ECR Repo

# Update these to match your actual ECS Cluster and Service names in AWS
ECS_CLUSTER="tasksphere-cluster"
ECS_SERVICE_SERVER="tasksphere-server-service"
ECS_SERVICE_CLIENT="tasksphere-client-service"

# --- 1. Authenticate Docker with Amazon ECR ---
echo "🔑 Logging in to Amazon ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
echo "✓ ECR Login Successful!"
echo ""

# --- 2. Build and Push Server Backend ---
echo "📦 Building server image..."
docker build -t ${ECR_REGISTRY}/${ECR_REPO_SERVER}:${IMAGE_TAG} ./server

echo "🚀 Pushing server image to ECR..."
docker push ${ECR_REGISTRY}/${ECR_REPO_SERVER}:${IMAGE_TAG}
echo "✓ Server Image Pushed!"
echo ""

# --- 3. Build and Push Client Frontend ---
echo "📦 Building client image..."
docker build --build-arg VITE_API_URL=${CLIENT_API_URL} -t ${ECR_REGISTRY}/${ECR_REPO_CLIENT}:${IMAGE_TAG} ./client

echo "🚀 Pushing client image to ECR..."
docker push ${ECR_REGISTRY}/${ECR_REPO_CLIENT}:${IMAGE_TAG}
echo "✓ Client Image Pushed!"
echo ""

# --- 4. Force ECS Redeployment ---
echo "🔄 Updating ECS services with the new images..."

echo "→ Redeploying Server service..."
aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE_SERVER} --force-new-deployment --region ${AWS_REGION} > /dev/null

echo "→ Redeploying Client service..."
aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE_CLIENT} --force-new-deployment --region ${AWS_REGION} > /dev/null

echo "🎉 Deployment initiated successfully!"
echo "It may take a few minutes for ECS to rotate the containers."
