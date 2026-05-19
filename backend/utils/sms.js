import axios from 'axios';
import qs from 'qs';

const SEMAPHORE_API_KEY = process.env.SEMAPHORE_API_KEY;
const SEMAPHORE_URL = 'https://api.semaphore.co/api/v4/messages';
const SENDER_NAME = 'capstoneweb'; // must be approved in Semaphore

/**
 * Send an SMS via Semaphore (Philippines).
 * @param {string[]} numbers  - Array of PH mobile numbers (09xxxxxxxxx or 639xxxxxxxxx)
 * @param {string}   message  - Message body (max 300 chars)
 */
export async function sendSMS(numbers, message) {
  if (!SEMAPHORE_API_KEY) {
    console.warn('❌ SEMAPHORE_API_KEY not set — SMS skipped');
    return;
  }

  // Normalize PH numbers to 639xxxxxxxxx format
  const cleanedNumbers = numbers
    .map(n => String(n).replace(/\D/g, ''))
    .map(n => {
      if (n.startsWith('09') && n.length === 11) return '63' + n.slice(1);
      if (n.startsWith('639') && n.length === 12) return n;
      return null;
    })
    .filter(Boolean);

  if (!cleanedNumbers.length) {
    console.warn('❌ No valid PH phone numbers after cleaning — SMS skipped');
    return;
  }

  const payload = qs.stringify({
    apikey: SEMAPHORE_API_KEY,
    number: cleanedNumbers.join(','),
    message: message.slice(0, 300),
    sendername: SENDER_NAME,
  });

  try {
    const response = await axios.post(SEMAPHORE_URL, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000,
    });
    console.log('✅ Semaphore SMS sent:', response.data);
  } catch (err) {
    console.error('❌ Semaphore SMS failed');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error(err.message);
    }
  }
}
