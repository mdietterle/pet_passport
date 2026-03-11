const http = require('http');
const https = require('https');

async function testVercelCheckout() {
  const formData = new URLSearchParams();
  formData.append('planId', '67056299-882e-4d0a-b6b7-f999888ca7f5'); // Pro plan

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // We need a valid session cookie to hit the checkout, which we don't have easily.
      // But we can check if it returns 401 Unauthorized or redirects to login.
    }
  };

  const req = https.request('https://pet-passport-sigma.vercel.app/api/abacatepay/checkout', options, (res) => {
    console.log("Status Code:", res.statusCode);
    console.log("Headers:", res.headers);
    res.on('data', (d) => process.stdout.write(d));
  });

  req.on('error', (e) => console.error(e));
  req.write(formData.toString());
  req.end();
}

testVercelCheckout();
