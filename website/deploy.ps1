# GrowthTracker Website Deployment Script (PowerShell)
# Deploy static website to AWS S3 + CloudFront

# Configuration
$BucketName = "growthtrackerapp.com"
$CloudFrontDistributionId = "YOUR_DISTRIBUTION_ID_HERE"  # Update after creating CloudFront distribution
$AwsRegion = "us-east-1"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  GrowthTracker Website Deployment" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Check if AWS CLI is installed
try {
    $null = Get-Command aws -ErrorAction Stop
} catch {
    Write-Host "Error: AWS CLI is not installed" -ForegroundColor Red
    Write-Host "Install it from: https://aws.amazon.com/cli/"
    exit 1
}

# Check if AWS credentials are configured
try {
    aws sts get-caller-identity 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Credentials not configured"
    }
} catch {
    Write-Host "Error: AWS credentials not configured" -ForegroundColor Red
    Write-Host "Run: aws configure"
    exit 1
}

# Sync files to S3
Write-Host "1. Uploading files to S3..." -ForegroundColor Green
aws s3 sync . "s3://$BucketName" `
  --region $AwsRegion `
  --exclude "*.ps1" `
  --exclude "*.sh" `
  --exclude "*.md" `
  --exclude ".DS_Store" `
  --exclude "bucket-policy.json" `
  --exclude ".git/*" `
  --cache-control "public, max-age=3600" `
  --delete

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error uploading to S3" -ForegroundColor Red
    exit 1
}

# Set longer cache for static assets
Write-Host "2. Setting cache headers for CSS..." -ForegroundColor Green
aws s3 cp "s3://$BucketName/styles.css" "s3://$BucketName/styles.css" `
  --region $AwsRegion `
  --cache-control "public, max-age=31536000" `
  --content-type "text/css" `
  --metadata-directive REPLACE

# Invalidate CloudFront cache
if ($CloudFrontDistributionId -ne "YOUR_DISTRIBUTION_ID_HERE") {
    Write-Host "3. Invalidating CloudFront cache..." -ForegroundColor Green
    aws cloudfront create-invalidation `
      --distribution-id $CloudFrontDistributionId `
      --paths "/*"
    Write-Host "   Cache invalidation initiated" -ForegroundColor Green
} else {
    Write-Host "3. Skipping CloudFront invalidation (distribution ID not set)" -ForegroundColor Blue
    Write-Host "   Update `$CloudFrontDistributionId in this script" -ForegroundColor Blue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Website URL: https://$BucketName"
Write-Host ""
