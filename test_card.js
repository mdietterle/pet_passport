const apiKey = 'abc_dev_r6ahpqyagGx5Lg03XUHE5Nb5';

async function testDirectBilling() {
  const payload = {
    frequency: "ONE_TIME",
    methods: ["CARD"],
    products: [
      {
        externalId: `test_cc`,
        name: `Teste Cartao`,
        description: `Teste`,
        quantity: 1,
        price: 500,
      },
    ],
    returnUrl: `http://localhost:3000`,
    completionUrl: `http://localhost:3000`,
    customer: {
      name: 'Teste Silva',
      email: 'teste@teste.com',
      cellphone: '11999999999',
      taxId: '76608930097', // Random valid CPF format
    }
  };

  const response = await fetch('https://api.abacatepay.com/v1/billing/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log("Status API:", response.status);
  console.log(JSON.stringify(data, null, 2));
}

testDirectBilling();
