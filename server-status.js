// server-status.js
// This script checks if the server is running and provides instructions on how to start it if it's not.

const SERVER_URL = 'http://localhost:3000/api/cookies';
const CHECK_INTERVAL = 60000; // Check every minute

async function checkServerStatus() {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'HEAD',
      cache: 'no-store'
    });
    
    if (response.ok) {
      console.log('Cookie Snitcher: Server is running.');
      return true;
    } else {
      console.warn(`Cookie Snitcher: Server responded with status ${response.status}`);
      
      if (response.status === 404) {
        console.warn('Cookie Snitcher: API endpoint not found. Make sure the server is running and the database is set up.');
        console.warn('Cookie Snitcher: Run "npm run migrate" to set up the database tables.');
        console.warn('Cookie Snitcher: Then run "npm run dev" to start the server.');
      }
      
      return false;
    }
  } catch (error) {
    console.error('Cookie Snitcher: Server is not running or not accessible.', error);
    console.warn('Cookie Snitcher: To fix this issue:');
    console.warn('1. Make sure the Next.js server is running with "npm run dev"');
    console.warn('2. Run "npm run migrate" to set up the database tables');
    console.warn('3. Check that your DATABASE_URL in .env is correct');
    console.warn('4. Ensure there are no CORS issues by checking the browser console');
    return false;
  }
}

// Check server status periodically
setInterval(async () => {
  const isRunning = await checkServerStatus();
  if (!isRunning) {
    console.warn('Cookie Snitcher: Server is not running. Make sure to start the Next.js server with "npm run dev" in the project directory.');
  }
}, CHECK_INTERVAL);

// Initial check when extension loads
checkServerStatus();

export { checkServerStatus };