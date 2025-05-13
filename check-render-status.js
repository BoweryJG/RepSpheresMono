/**
 * Check Render Status
 * 
 * A simple utility script to check the status of the Render backend service.
 * This can be run at any time to verify that the service is up and responding.
 */

// Render backend URL
const API_BASE_URL = 'https://osbackend-zl1h.onrender.com';
const HEALTH_ENDPOINT = '/health';

/**
 * Check if the Render service is up and responding
 */
async function checkRenderStatus() {
  console.log('===== Checking Render Service Status =====');
  console.log(`Checking service at: ${API_BASE_URL}`);
  
  try {
    console.log('Sending health check request...');
    const startTime = Date.now();
    
    const response = await fetch(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.ok) {
      console.log(`\n✅ Render service is UP and responding`);
      console.log(`Response time: ${responseTime}ms`);
      
      try {
        const data = await response.json();
        console.log('Response data:', data);
      } catch (e) {
        // If the response is not JSON, just show the status
        console.log(`Status: ${response.status} ${response.statusText}`);
      }
    } else {
      console.error(`\n❌ Render service returned error status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('\n❌ Failed to connect to Render service');
    console.error('Error details:', error.message);
    console.log('\nPossible causes:');
    console.log('1. The Render service is down or sleeping');
    console.log('2. Network connectivity issues');
    console.log('3. Firewall or security restrictions');
  }
  
  console.log('\n===== Status Check Complete =====');
}

// Run the status check
checkRenderStatus().catch(error => {
  console.error('Unhandled error:', error);
});
