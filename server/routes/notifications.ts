import { Router, Request, Response } from 'express';
import { admin, rtdb } from '../firebase';

const router = Router();

router.post('/send-fcm', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, body, imageUrl, link, target, uid } = req.body;

    if (!title || !body || !target) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    const payload = {
      notification: {
        title,
        body,
        ...(imageUrl && { image: imageUrl })
      },
      data: {
        link: link || "",
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      }
    };

    if (target === 'all') {
      const snapshot = await rtdb.ref('users').once('value');
      const usersData = snapshot.val() || {};
      
      const tokens: string[] = [];
      for (const key in usersData) {
        if (usersData[key].fcmToken) {
          tokens.push(usersData[key].fcmToken);
        }
      }

      if (tokens.length === 0) {
        res.json({ success: true, sent: 0, failed: 0, message: "No FCM tokens found" });
        return;
      }

      let sentCount = 0;
      let failedCount = 0;

      // Group tokens into batches of 500
      const BATCH_SIZE = 500;
      for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
        const batchTokens = tokens.slice(i, i + BATCH_SIZE);
        const message = {
          ...payload,
          tokens: batchTokens
        };
        const response = await admin.messaging().sendEachForMulticast(message);
        sentCount += response.successCount;
        failedCount += response.failureCount;
      }

      res.json({ success: true, sent: sentCount, failed: failedCount });

    } else if (target === 'uid') {
      if (!uid) {
        res.status(400).json({ success: false, error: 'uid is required when target is uid' });
        return;
      }

      const snapshot = await rtdb.ref(`users/${uid}/fcmToken`).once('value');
      const token = snapshot.val();

      if (!token) {
        res.status(404).json({ success: false, error: 'User does not have an FCM token' });
        return;
      }

      const message = {
        ...payload,
        token
      };

      try {
        await admin.messaging().send(message);
        res.json({ success: true, sent: 1, failed: 0 });
      } catch (err: any) {
        res.json({ success: false, sent: 0, failed: 1, error: err.message });
      }
    } else {
      res.status(400).json({ success: false, error: 'Invalid target type' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;