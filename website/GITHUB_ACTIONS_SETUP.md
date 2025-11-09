# GitHub Actions Setup for Website Deployment

This guide will help you set up automatic deployment of the GrowthTracker website to AWS S3 whenever you push changes.

## Prerequisites

1. AWS Account with S3 bucket created (`growthtrackerapp.com`)
2. CloudFront distribution (optional but recommended)
3. GitHub repository

## Step 1: Create AWS IAM User for GitHub Actions

### 1.1 Create IAM User

1. Go to AWS Console > IAM > Users
2. Click **Add users**
3. User name: `github-actions-website-deploy`
4. Access type: **Programmatic access** (Access key ID and Secret access key)
5. Click **Next: Permissions**

### 1.2 Create IAM Policy

1. Click **Attach existing policies directly**
2. Click **Create policy**
3. Click **JSON** tab
4. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::growthtrackerapp.com",
        "arn:aws:s3:::growthtrackerapp.com/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "*"
    }
  ]
}
```

5. Click **Next: Tags** (optional)
6. Click **Next: Review**
7. Name: `GitHubActionsWebsiteDeployPolicy`
8. Click **Create policy**

### 1.3 Attach Policy to User

1. Go back to user creation
2. Refresh policies and search for `GitHubActionsWebsiteDeployPolicy`
3. Check the box next to it
4. Click **Next: Tags** (optional)
5. Click **Next: Review**
6. Click **Create user**
7. **IMPORTANT**: Save the **Access key ID** and **Secret access key**
   - You won't be able to see the secret key again!

## Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add these secrets:

### Required Secrets:

#### 2.1 AWS_ACCESS_KEY_ID
- Name: `AWS_ACCESS_KEY_ID`
- Value: Your IAM user's Access key ID (from Step 1.3)

#### 2.2 AWS_SECRET_ACCESS_KEY
- Name: `AWS_SECRET_ACCESS_KEY`
- Value: Your IAM user's Secret access key (from Step 1.3)

#### 2.3 CLOUDFRONT_DISTRIBUTION_ID (Optional)
- Name: `CLOUDFRONT_DISTRIBUTION_ID`
- Value: Your CloudFront distribution ID (e.g., `E1234567890ABC`)
- **Note**: If you don't have CloudFront yet, skip this. The workflow will still work.

## Step 3: Test the Workflow

### Option A: Push a Change

1. Make a change to any file in the `website/` directory
2. Commit and push:
   ```bash
   git add website/
   git commit -m "Update website"
   git push origin mainline
   ```
3. Go to GitHub > Actions tab
4. Watch the "Deploy Website to S3" workflow run

### Option B: Manual Trigger

1. Go to GitHub > Actions
2. Click "Deploy Website to S3"
3. Click "Run workflow"
4. Select branch: `mainline`
5. Click "Run workflow"

## Step 4: Verify Deployment

After the workflow completes:

1. Check S3 bucket: `https://s3.console.aws.amazon.com/s3/buckets/growthtrackerapp.com`
2. Visit your website: `https://growthtrackerapp.com`
3. If using CloudFront, cache invalidation may take 1-2 minutes

## Workflow Triggers

The workflow runs automatically when:
- You push changes to the `mainline` branch
- Changes are in the `website/` directory
- You manually trigger it from GitHub Actions

## How It Works

1. **Checkout**: Gets your code
2. **Configure AWS**: Sets up AWS credentials
3. **Sync to S3**: Uploads changed files to S3
4. **Set Cache Headers**: Sets long cache for CSS (1 year)
5. **Invalidate CloudFront**: Clears CDN cache (if configured)

## Troubleshooting

### Error: "Unable to locate credentials"
- Check that `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set in GitHub Secrets
- Verify secrets have no leading/trailing spaces

### Error: "Access Denied"
- Verify IAM policy is attached to the user
- Check bucket name is correct in the policy

### Error: "Bucket does not exist"
- Verify S3 bucket `growthtrackerapp.com` exists
- Check bucket is in `us-east-1` region

### CloudFront invalidation skipped
- This is normal if `CLOUDFRONT_DISTRIBUTION_ID` secret is not set
- Add the secret when you create CloudFront distribution

### Files not updating on website
- CloudFront cache may take 1-2 minutes to clear
- Try hard refresh in browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check CloudFront invalidation completed in AWS Console

## Security Best Practices

✅ **DO:**
- Use IAM user with minimal permissions (only S3 and CloudFront)
- Rotate access keys periodically
- Enable MFA on AWS account
- Review CloudWatch logs for suspicious activity

❌ **DON'T:**
- Don't use root AWS account credentials
- Don't commit AWS credentials to the repository
- Don't share secret access keys

## Cost Impact

- **GitHub Actions**: 2,000 free minutes/month (plenty for website deploys)
- **AWS S3 API calls**: ~$0.005 per 1,000 PUT requests
- **CloudFront invalidations**: First 1,000/month free, then $0.005 each

**Expected cost**: Nearly $0 for normal usage

## Updating the Workflow

The workflow file is at: `.github/workflows/deploy-website.yml`

To modify:
1. Edit the file
2. Commit and push
3. Next deployment will use updated workflow

## Manual Deployment (Backup)

If GitHub Actions is down, you can still deploy manually:

```powershell
cd website
.\deploy.ps1
```

Or use the bash script:
```bash
cd website
./deploy.sh
```

## Next Steps

After setup is complete:

1. ✅ Set up CloudFront distribution (recommended)
2. ✅ Add `CLOUDFRONT_DISTRIBUTION_ID` secret
3. ✅ Configure custom domain in Route53
4. ✅ Set up SSL certificate in ACM
5. ✅ Test automatic deployment

## Support

If you encounter issues:
1. Check GitHub Actions logs for detailed error messages
2. Verify AWS IAM permissions
3. Test AWS credentials locally with AWS CLI
4. Review S3 bucket policy

## Example Deployment Log

Successful deployment should look like:
```
✅ Checkout code
✅ Configure AWS credentials
✅ Sync files to S3
   - index.html uploaded
   - styles.css uploaded
   - privacy-policy.html uploaded
   - terms-of-service.html uploaded
✅ Set cache headers for CSS
✅ Invalidate CloudFront cache
✅ Website deployed to S3
📦 Bucket: growthtrackerapp.com
🌐 URL: https://growthtrackerapp.com
```
