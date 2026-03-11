

async function testVercelWebhook() {
  const payload = {
    event: 'billing.paid',
    data: {
      status: 'PAID',
      customer: {},
      products: [],
      metadata: {
        returnUrl: "https://pet-passport-sigma.vercel.app/dashboard/plans",
        completionUrl: "https://pet-passport-sigma.vercel.app/dashboard/plans?abacate_success=true&plan=69955643-1ed7-43bd-9d8d-5e6bdb819671&user=66b725be-fe7f-48e9-a85e-646eb348127d"
      }
    }
  };

  const res = await fetch('https://pet-passport-sigma.vercel.app/api/abacatepay/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const body = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", body);
}

testVercelWebhook();
