

async function testWebhook() {
  const payload = {
    event: 'billing.paid',
    data: {
      status: 'PAID',
      customer: {},
      products: [
        { externalId: 'testuser_testplan' }
      ]
    }
  };

  const res = await fetch('http://localhost:3000/api/abacatepay/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log(res.status, text);
}

testWebhook();
