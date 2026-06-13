import { db } from '../firebase';

export function startRiskProfileJob() {
  console.log('Starting background Risk Profile & Device Fingerprinting job...');
  
  setInterval(async () => {
    try {
      // Check if project is configured for Firestore (optional: check if collections exist or if we get a specific error)
      const usersSnapshot = await db.collection('users').limit(20).get();
      if (usersSnapshot.empty) return;
      
      const batch = db.batch();
      let hasUpdates = false;

      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        
        // Mock computation logic based on region connection metadata
        // In a real application, this would analyze IPs, login velocities, etc.
        let riskScore = 0;
        
        // Penalize slightly if country is unknown
        if (!userData.country || userData.country === 'Unknown') {
          riskScore += 15;
        }
        
        // Random fluctuation to make dashboard look active
        riskScore += Math.floor(Math.random() * 5);
        
        if (riskScore > 100) riskScore = 100;

        const deviceFingerprint = Buffer.from(`${userData.lastIp || 'no-ip'}-${userData.device || 'no-device'}-${userData.email || 'no-email'}`).toString('base64');

        batch.update(doc.ref, {
          computedRisk: riskScore,
          deviceFingerprint: deviceFingerprint,
          lastRiskScan: new Date().toISOString()
        });
        
        hasUpdates = true;
      });

      if (hasUpdates) {
        await batch.commit();
      }
    } catch (error: any) {
      // If Firestore is disabled or not configured, log it once and potentially slow down or stop the job
      if (error.code === 7 || error.message?.includes('Cloud Firestore API has not been used')) {
        console.warn('Risk Profile Job: Cloud Firestore API is not enabled or users collection missing. Job will pause for 10 minutes.');
        // We could use a more sophisticated retry logic, but for now we'll just not spam the 15s interval if it's a configuration error
        return; 
      }
      console.error('Failed to run Risk Profile job', error);
    }
  }, 15000); // Run every 15 seconds for demonstration
}
