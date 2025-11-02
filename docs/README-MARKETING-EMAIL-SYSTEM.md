# Marketing Email System

A comprehensive email marketing system for Dehli Mirch e-commerce platform with full campaign management, tracking, and automation.

## Features

### 1. Email Collection

- **Footer Newsletter**: Users can subscribe via footer newsletter form
- **Database Storage**: Emails stored in `MarketingEmail` model with unique unsubscribe tokens
- **Duplicate Prevention**: Prevents duplicate subscriptions, allows reactivation

### 2. Campaign Management

- **Admin Interface**: Full CRUD operations for marketing campaigns
- **Campaign Status**: Draft, Scheduled, Sending, Sent, Paused, Cancelled
- **Scheduling**: Schedule campaigns for future delivery
- **Templates**: Multiple email templates (Default, Promotional, Newsletter)

### 3. Email Delivery

- **Cron Job**: Automated email sending via `/api/cron/send-marketing-emails`
- **Batch Processing**: Sends emails in batches to avoid SMTP rate limits
- **Error Handling**: Tracks bounced emails and delivery failures
- **SMTP Integration**: Uses Nodemailer with configurable SMTP settings

### 4. Email Tracking

- **Open Tracking**: 1x1 pixel tracking for email opens
- **Click Tracking**: URL wrapping for click tracking
- **Bounce Tracking**: Monitors and records email bounces
- **Analytics**: Comprehensive campaign statistics

### 5. Unsubscribe System

- **One-Click Unsubscribe**: Easy unsubscribe process
- **Token-Based**: Secure unsubscribe tokens
- **Compliance**: Includes List-Unsubscribe headers for email clients

## Database Models

### MarketingEmail

```typescript
{
  email: string;                    // User's email address
  isActive: boolean;               // Subscription status
  subscribedAt: Date;              // When user subscribed
  unsubscribedAt?: Date;           // When user unsubscribed
  unsubscribeToken: string;        // Unique token for unsubscribe
  campaigns: [                     // Campaign tracking array
    {
      campaignId: ObjectId;        // Reference to campaign
      campaignName: string;        // Campaign name
      sent: boolean;               // Whether email was sent
      sentAt?: Date;               // When email was sent
      opened?: boolean;            // Whether email was opened
      openedAt?: Date;             // When email was opened
      clicked?: boolean;           // Whether links were clicked
      clickedAt?: Date;            // When links were clicked
      bounced?: boolean;           // Whether email bounced
      bouncedAt?: Date;            // When email bounced
      bouncedReason?: string;      // Reason for bounce
    }
  ];
}
```

### MarketingCampaign

```typescript
{
  name: string;                    // Campaign name
  subject: string;                 // Email subject line
  content: string;                 // Email content (HTML)
  template: string;                // Template to use
  status: string;                  // Campaign status
  scheduledAt?: Date;              // When to send (optional)
  sentAt?: Date;                   // When campaign was sent
  totalRecipients: number;         // Total number of recipients
  sentCount: number;               // Number of emails sent
  openedCount: number;             // Number of emails opened
  clickedCount: number;            // Number of clicks
  bouncedCount: number;            // Number of bounces
  createdBy: ObjectId;             // Admin who created campaign
}
```

## API Endpoints

### Public Endpoints

- `POST /api/newsletter` - Subscribe to newsletter
- `GET /unsubscribe` - Unsubscribe page
- `POST /api/unsubscribe` - Process unsubscribe request

### Admin Endpoints

- `GET /api/admin/marketing-campaigns` - List campaigns
- `POST /api/admin/marketing-campaigns` - Create campaign
- `PUT /api/admin/marketing-campaigns` - Update campaign
- `DELETE /api/admin/marketing-campaigns` - Delete campaign

### Tracking Endpoints

- `GET /api/track/email-open` - Track email opens
- `GET /api/track/email-click` - Track email clicks

### Cron Endpoints

- `GET /api/cron/send-marketing-emails` - Send scheduled campaigns

## Environment Variables

Add these to your `.env.local` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Dehli Mirch <noreply@dehlimirch.com>

# Base URL for tracking and unsubscribe links
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install nodemailer
npm install @types/nodemailer --save-dev
```

### 2. Database Setup

The models are automatically registered in `models/index.ts`. No additional setup required.

### 3. SMTP Configuration

Configure your SMTP settings in environment variables. For Gmail:

1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `SMTP_PASS`

### 4. Cron Job Setup

Set up a cron job to run the email sending endpoint:

```bash
# Run every 5 minutes
*/5 * * * * curl -X GET https://yourdomain.com/api/cron/send-marketing-emails
```

Or use a service like:

- **Vercel Cron Jobs**: Add to `vercel.json`
- **GitHub Actions**: Scheduled workflow
- **External Services**: UptimeRobot, Cron-job.org

### 5. Admin Access

Access the marketing campaigns interface at `/admin/marketing-campaigns` (admin role required).

## Usage Guide

### Creating a Campaign

1. Go to `/admin/marketing-campaigns`
2. Click "New Campaign"
3. Fill in campaign details:
   - **Name**: Internal campaign name
   - **Subject**: Email subject line
   - **Content**: HTML email content
   - **Template**: Choose from available templates
   - **Schedule**: Optional future send time
4. Save as draft or schedule for later

### Email Templates

The system includes three built-in templates:

- **Default**: Clean, simple design
- **Promotional**: Eye-catching for sales
- **Newsletter**: Structured for regular updates

### Tracking Campaign Performance

View campaign statistics in the admin interface:

- **Sent Count**: Number of emails successfully sent
- **Open Rate**: Percentage of emails opened
- **Click Rate**: Percentage of links clicked
- **Bounce Rate**: Percentage of emails bounced

### Managing Subscribers

- **Active Subscribers**: Users who haven't unsubscribed
- **Unsubscribe Tracking**: Automatic tracking of unsubscribes
- **Reactivation**: Users can resubscribe if previously unsubscribed

## Security Features

### Unsubscribe Tokens

- Cryptographically secure random tokens
- Unique per email address
- Not guessable or enumerable

### Email Validation

- Proper email format validation
- Duplicate prevention
- Case-insensitive email handling

### Rate Limiting

- Batch processing to avoid SMTP limits
- Delays between batches
- Error handling for failed deliveries

## Compliance

### CAN-SPAM Act Compliance

- Clear unsubscribe mechanism
- Physical address in emails
- Honest subject lines
- Clear sender identification

### GDPR Considerations

- Explicit consent for email collection
- Easy unsubscribe process
- Data retention policies
- User data export capabilities

## Monitoring and Analytics

### Campaign Metrics

- Delivery rates
- Open rates
- Click-through rates
- Bounce rates
- Unsubscribe rates

### Performance Monitoring

- SMTP delivery status
- Error logging
- Campaign processing times
- Database performance

## Troubleshooting

### Common Issues

1. **Emails not sending**

   - Check SMTP credentials
   - Verify SMTP server settings
   - Check cron job is running

2. **Tracking not working**

   - Verify `NEXT_PUBLIC_BASE_URL` is set
   - Check email client image loading
   - Ensure tracking endpoints are accessible

3. **High bounce rates**
   - Verify email list quality
   - Check sender reputation
   - Review email content for spam triggers

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

## Future Enhancements

### Planned Features

- **A/B Testing**: Test different subject lines and content
- **Segmentation**: Target specific user groups
- **Automation**: Triggered email sequences
- **Advanced Analytics**: Detailed reporting dashboard
- **Template Editor**: Visual template builder
- **Integration**: Connect with external email services

### Performance Optimizations

- **Queue System**: Redis-based email queue
- **Caching**: Campaign and subscriber caching
- **CDN**: Image and asset delivery
- **Database Indexing**: Optimized queries

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review error logs
3. Verify environment configuration
4. Test with a small campaign first

## License

This marketing email system is part of the Dehli Mirch e-commerce platform and follows the same licensing terms.

