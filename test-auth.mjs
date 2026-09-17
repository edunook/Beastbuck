import { verifyRecovery } from './backend/services/authAdminService.js';

async function test() {
  try {
    console.log('Testing verifyRecovery...');
    const res = await verifyRecovery('testuser', '1234567890');
    console.log('Result:', res);
  } catch (err) {
    console.error('Error in verifyRecovery:', err.message);
  }
}

test();
