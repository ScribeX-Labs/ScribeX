# Scribe Transcription App

Scribe helps users accurately transcribe audio or video files and use up-to-date AI features to help users better understand the transcript.

## Features

- Transcribe audio and video files
- AI-powered analysis of transcripts
- Easy sharing and export capabilities

## Subscription Tiers

Scribe offers two subscription tiers:

### Free Tier
- File size limit: 500MB
- Duration limit: 2 minutes
- Basic transcription features
- Limited AI analysis

### Pro Tier
- Unlimited file size (up to 5GB)
- Unlimited duration (up to 4 hours)
- Advanced transcription accuracy
- Full AI analysis capabilities
- Priority support

## Development Setup

1. Clone the repository
2. Setup the server:
   ```
   cd server
   pip install -r requirements.txt
   python main.py
   ```
3. Setup the client:
   ```
   cd client
   pnpm install
   pnpm dev
   ```

## User Subscription Management

### Migration for Existing Users

When deploying the subscription tier system, you need to migrate existing users to have subscription records. Run the following command:

```
python main.py --migrate
```

This will create a default FREE tier subscription for all existing users.

### Environment Variables

You can set the following environment variables:

- `MIGRATE_ON_STARTUP`: Set to "true" to run the migration when the server starts (default is "false")

### API Endpoints

- GET `/subscriptions/{user_id}`: Get a user's subscription details
- POST `/subscriptions/{user_id}`: Update a user's subscription tier

## License

All rights reserved. 