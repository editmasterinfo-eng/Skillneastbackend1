import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase';

// Memory cache for stream URLs (in a real scalable backend, you'd use Redis)
interface StreamMapping {
  originalUrl: string;
  expiresAt: number;
  userId: string;
}

const streamMap = new Map<string, StreamMapping>();

/**
 * Service to handle interacting with Telegram Bot API or resolving direct URLs
 * and converting them into temporary, secure proxies.
 */
export class TelegramService {
  
  /**
   * Fetches the real stream URL for a given course/video ID from the Telegram bot.
   * Then, creates a short-lived UUID proxy link.
   */
  static async requestSecureStream(videoId: string, userId: string): Promise<string | null> {
    try {
      // 1. Resolve videoId to its Telegram Message ID or file reference from Firestore
      const videoDoc = await db.collection('videos').doc(videoId).get();
      if (!videoDoc.exists) return null;
      
      const videoData = videoDoc.data();
      const telegramLink = videoData?.telegramLink;
      
      if (!telegramLink) return null;
      
      // 2. In reality, here you would call the Telegram API to get the absolute file URL
      // e.g. https://api.telegram.org/bot<token>/getFile?file_id=...
      // For this implementation, we assume we fetch the actual m3u8/mp4 link.
      // (Mocking the resolution here)
      const resolvedDirectUrl = `https://telegram-cdn-mock.example.com/stream/${telegramLink}/manifest.m3u8`;
      
      // 3. Create a temporary, secure UUID for proxy mapping
      const proxyId = uuidv4();
      
      // Expires in 10 minutes
      streamMap.set(proxyId, {
        originalUrl: resolvedDirectUrl,
        expiresAt: Date.now() + 10 * 60 * 1000,
        userId
      });
      
      return `/api/stream/proxy/${proxyId}`;
    } catch (error) {
      console.error('Error requesting secure stream:', error);
      return null;
    }
  }

  /**
   * Retrieves the original URL if the proxy UUID is valid and unexpired.
   */
  static resolveProxyId(proxyId: string, userId: string): string | null {
    const mapping = streamMap.get(proxyId);
    if (!mapping) return null;

    if (Date.now() > mapping.expiresAt) {
      streamMap.delete(proxyId);
      return null;
    }

    // Ensure the user requesting is the same who generated it (prevents link sharing)
    if (mapping.userId !== userId) {
      return null;
    }

    // Refresh expiration on access occasionally or keep it strict. 
    return mapping.originalUrl;
  }
}
