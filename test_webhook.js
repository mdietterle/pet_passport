const fetch = require('node-fetch'); // Use modern node fetch if available, or just standard fetch
// Using built in fetch for Node 18+

async function testWebhook() {
  // We need valid user ID and plan ID to test.
  // We can pass them as args or hardcode a fake one just to see if the webhook parses it and tries to hit Supabase.
  const payload = {
    event: "billing.paid",
    data: {
      status: "PAID",
      customer: {
        email: "test@example.com"
      },
      products: [
        {
          externalId: "REPLACE_USER_ID_REPLACE_PLAN_ID" // Requires actual UUIDs from DB to truly test update
        }
      ]
    }
  };

  try {
    const res = await fetch('http://localhost:3000/api/abacatepay/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
  } catch (err) {
    console.error(err);
  }
}

testWebhook();
