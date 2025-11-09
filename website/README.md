# GrowthTracker Website

Static website for GrowthTracker app, designed to be hosted on AWS S3 + CloudFront with Route53.

## Files

- `index.html` - Main landing page
- `privacy-policy.html` - Privacy policy page
- `terms-of-service.html` - Terms of service page
- `styles.css` - Shared stylesheet
- `robots.txt` - Search engine directives
- `sitemap.xml` - Sitemap for SEO

## Deployment to AWS

### Prerequisites

1. AWS Account
2. AWS CLI installed and configured (`aws configure`)
3. Domain registered in Route53 (`growthtrackerapp.com`)
4. SSL Certificate requested in ACM (us-east-1 region for CloudFront)

### Step 1: Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://growthtrackerapp.com --region us-east-1

# Enable static website hosting
aws s3 website s3://growthtrackerapp.com \
  --index-document index.html \
  --error-document index.html
```

### Step 2: Configure Bucket Policy

Create `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::growthtrackerapp.com/*"
    }
  ]
}
```

Apply policy:

```bash
aws s3api put-bucket-policy \
  --bucket growthtrackerapp.com \
  --policy file://bucket-policy.json
```

### Step 3: Upload Website Files

```bash
# From the website directory
cd website

# Upload all files
aws s3 sync . s3://growthtrackerapp.com \
  --exclude "README.md" \
  --exclude ".DS_Store" \
  --cache-control "public, max-age=3600"

# Set longer cache for CSS (with versioning)
aws s3 cp styles.css s3://growthtrackerapp.com/styles.css \
  --cache-control "public, max-age=31536000" \
  --content-type "text/css"
```

### Step 4: Create CloudFront Distribution

```bash
# Create CloudFront distribution (use AWS Console for easier setup)
# Or use AWS CLI with a config file
```

**CloudFront Settings:**
- Origin Domain: `growthtrackerapp.com.s3-website-us-east-1.amazonaws.com`
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Alternate Domain Names (CNAMEs): `growthtrackerapp.com`, `www.growthtrackerapp.com`
- SSL Certificate: Select your ACM certificate
- Default Root Object: `index.html`
- Error Pages: Configure 404 to redirect to `index.html` with 200 status

### Step 5: Configure Route53

Create A records in Route53:

```bash
# Get CloudFront distribution domain name (e.g., d123456abcdef.cloudfront.net)
CLOUDFRONT_DOMAIN="<your-cloudfront-domain>"

# Create alias record for apex domain
# (Do this in AWS Console: Route53 > Hosted Zones > growthtrackerapp.com > Create Record)
# - Record name: (leave blank)
# - Record type: A
# - Alias: Yes
# - Route traffic to: Alias to CloudFront distribution
# - Select your CloudFront distribution

# Create alias record for www subdomain
# - Record name: www
# - Record type: A
# - Alias: Yes
# - Route traffic to: Alias to CloudFront distribution
# - Select your CloudFront distribution
```

### Step 6: Request SSL Certificate (ACM)

**Important:** Certificate must be in `us-east-1` region for CloudFront!

```bash
# Request certificate
aws acm request-certificate \
  --domain-name growthtrackerapp.com \
  --subject-alternative-names www.growthtrackerapp.com \
  --validation-method DNS \
  --region us-east-1
```

Follow the DNS validation process in ACM console.

### Step 7: Update CloudFront with SSL

Once certificate is validated, update CloudFront distribution to use the certificate.

## Updating the Website

```bash
# Make changes to HTML/CSS files

# Upload changes
aws s3 sync . s3://growthtrackerapp.com \
  --exclude "README.md" \
  --exclude ".DS_Store" \
  --cache-control "public, max-age=3600"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <YOUR_DISTRIBUTION_ID> \
  --paths "/*"
```

## Quick Deploy Script

Create `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "Uploading to S3..."
aws s3 sync . s3://growthtrackerapp.com \
  --exclude "README.md" \
  --exclude "deploy.sh" \
  --exclude ".DS_Store" \
  --exclude "bucket-policy.json" \
  --cache-control "public, max-age=3600"

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id <YOUR_DISTRIBUTION_ID> \
  --paths "/*"

echo "Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Costs Estimate

- **S3**: ~$0.50/month for small site (storage + requests)
- **CloudFront**: First 1TB free, then ~$0.085/GB
- **Route53**: $0.50/month per hosted zone + $0.40/million queries
- **ACM Certificate**: FREE

**Total**: ~$1-2/month for a small traffic website

## Testing

Before deploying:
1. Open `index.html` in a browser locally
2. Test all navigation links
3. Verify responsive design on mobile
4. Check Privacy Policy and Terms of Service pages
5. Validate HTML: https://validator.w3.org/

## SEO Optimization

- Sitemap submitted to Google Search Console
- robots.txt configured
- Meta descriptions on all pages
- Structured data (optional)
- Page speed optimization

## Security Headers (CloudFront Functions)

Consider adding security headers via CloudFront Functions:
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`

## Monitoring

Set up CloudWatch alarms for:
- CloudFront 4xx/5xx errors
- S3 bucket access
- Unusual traffic patterns

## Backup

S3 versioning is recommended:

```bash
aws s3api put-bucket-versioning \
  --bucket growthtrackerapp.com \
  --versioning-configuration Status=Enabled
```
