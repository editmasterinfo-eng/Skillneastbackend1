import { db } from '../firebase';

export function startRiskProfileJob() {
  console.log('Starting background Risk Profile & Device Fingerprinting job...');
  
  setInterval(async () => {
    try {
      // Fetch a small batch of online or recent users to evaluate
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

        const deviceFingerprint = Buffer.from(`${userData.lastIp}-${userData.device}-${userData.email}`).toString('base64');

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
    } catch (error) {
      console.error('Failed to run Risk Profile job', error);
    }
  }, 15000); // Run every 15 seconds for demonstration
}
