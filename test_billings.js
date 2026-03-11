const AbacatePay = require('abacatepay-nodejs-sdk').default;

async function checkBillings() {
  try {
    const abacate = AbacatePay('abc_dev_r6ahpqyagGx5Lg03XUHE5Nb5');
    const billings = await abacate.billing.list();
    // Sort by createdAt descending
    const sorted = billings.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentPAID = sorted.filter(b => b.status === 'PAID').slice(0, 5);
    
    recentPAID.forEach(b => {
      console.log(`- ID: ${b.id}`);
      console.log(`  Created At: ${b.createdAt}`);
      console.log(`  Completion URL: ${b.metadata?.completionUrl}`);
      console.log(`  User metadata: ${b.customer?.metadata?.supabase_user_id || b.customer?.metadata?.plan_id ? JSON.stringify(b.customer?.metadata) : 'None'}`);
    });
  } catch(e) {
    console.error(e);
  }
}

checkBillings();
