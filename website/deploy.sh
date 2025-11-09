#!/bin/bash
# GrowthTracker Website Deployment Script
# Deploy static website to AWS S3 + CloudFront

set -e

# Configuration
BUCKET_NAME="growthtrackerapp.com"
CLOUDFRONT_DISTRIBUTION_ID="YOUR_DISTRIBUTION_ID_HERE"  # Update after creating CloudFront distribution
AWS_REGION="us-east-1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  GrowthTracker Website Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS credentials not configured"
    echo "Run: aws configure"
    exit 1
fi

# Sync files to S3
echo -e "${GREEN}1. Uploading files to S3...${NC}"
aws s3 sync . s3://${BUCKET_NAME} \
  --region ${AWS_REGION} \
  --exclude "*.sh" \
  --exclude "*.md" \
  --exclude ".DS_Store" \
  --exclude "bucket-policy.json" \
  --exclude ".git/*" \
  --cache-control "public, max-age=3600" \
  --delete

# Set longer cache for static assets
echo -e "${GREEN}2. Setting cache headers for CSS...${NC}"
aws s3 cp s3://${BUCKET_NAME}/styles.css s3://${BUCKET_NAME}/styles.css \
  --region ${AWS_REGION} \
  --cache-control "public, max-age=31536000" \
  --content-type "text/css" \
  --metadata-directive REPLACE

# Invalidate CloudFront cache
if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "YOUR_DISTRIBUTION_ID_HERE" ]; then
    echo -e "${GREEN}3. Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation \
      --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
      --paths "/*"
    echo -e "${GREEN}   Cache invalidation initiated${NC}"
else
    echo -e "${BLUE}3. Skipping CloudFront invalidation (distribution ID not set)${NC}"
    echo -e "${BLUE}   Update CLOUDFRONT_DISTRIBUTION_ID in this script${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Website URL: https://${BUCKET_NAME}"
echo ""
