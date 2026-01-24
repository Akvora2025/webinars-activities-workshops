# VAPID Keys Setup

To enable web push notifications, you need to generate VAPID keys and add them to your `.env` file.

## Generate VAPID Keys

Run this command in your server directory:

```bash
cd server
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('VAPID_PUBLIC_KEY=' + keys.publicKey); console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);"
```

## Add to .env

Copy the output and add these lines to your `server/.env` file:

```
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:admin@akvora.com
```

Replace `admin@akvora.com` with your actual contact email.

## Client Environment

Make sure your `client/.env` has:

```
VITE_API_URL=http://localhost:5000/api
```

## Restart Servers

After adding the VAPID keys, restart both servers:

```bash
# In server directory
npm run dev

# In client directory  
npm run dev
```

The web push notifications will now work!
