async function testVercelWebhook() {
  const payload = {
    event: 'billing.paid',
    data: {
      status: 'PAID',
      customer: {},
      products: [],
      metadata: {
        returnUrl: "https://pet-passport-sigma.vercel.app/dashboard/plans",
        completionUrl: "https://pet-passport-sigma.vercel.app/dashboard/plans?abacate_success=true&plan=67056299-882e-4d0a-b6b7-f999888ca7f5&user=c521e60f-083b-4a85-9e64-f10ecae3119f"
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
