const payload = {
    data: {
        id: "bill_SANDBOX_CARD_TEST_MOCK",
        amount: 2500,
        status: "PAID",
        methods: ["CARD"],
        customer: {
            metadata: {
                supabase_user_id: "c521e60f-083b-4a85-9e64-f10ecae3119f",
                plan_id: "67056299-882e-4d0a-b6b7-f999888ca7f5"
            }
        },
        metadata: {
            completionUrl: "http://localhost:3000/dashboard/plans?abacate_success=true&plan=67056299-882e-4d0a-b6b7-f999888ca7f5&user=c521e60f-083b-4a85-9e64-f10ecae3119f&method=CARD"
        }
    },
    event: "billing.paid"
};

async function testWebhook() {
    console.log("Sending mock webhook to Vercel...");
    const response = await fetch('https://pet-passport-sigma.vercel.app/api/abacatepay/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const text = await response.text();
    console.log("Status:", response.status, text);
}

testWebhook();
