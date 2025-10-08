import * as dotenv from 'dotenv';
import webpush from 'web-push';

dotenv.config();

// Generate VAPID keys (ideally done once and stored securely)
const vapidKeys = {
    publicKey: 'BHiyLofic8-l4Co7aGD1eqQ6PAdtYuu3TsavfLh3gJ7r5ac-ICNhtL_QgYJLZzNpHwo31cqa1Ys2hZkAMECqBlA',
    privateKey: 'cZ5mh2yU7gJoWhRGca9uD0w9hALrnLthwvdQF_mpT6A'
}

export const WebPushConfig = {
  publicKey: vapidKeys.publicKey,
  privateKey: vapidKeys.privateKey,
  subject: 'mailto:bryan.rich0604@gmail.com',
  
  // Configure web push with VAPID details
  configure: () => { 
    webpush.setVapidDetails(
      WebPushConfig.subject,
      WebPushConfig.publicKey,
      WebPushConfig.privateKey
    );
  }
};