import axios from "axios";

// Configuration
const API_URL = "http://localhost:5000/api"; // Adjust based on your server port
const PRODUCT_ID = 1; // Replace with an existing product ID
const BUYER_ID = 1; // Replace with an existing buyer ID
const ADDRESS_ID = 1; // Replace with an existing address ID
const COOKIE = "token=YOUR_AUTH_TOKEN_HERE"; // Replace with a valid auth cookie

async function simulateConcurrentOrders() {
  console.log("🚀 Starting concurrency test...");

  // Number of concurrent requests
  const concurrency = 5;
  const requests = [];

  for (let i = 0; i < concurrency; i++) {
    const orderData = {
      buyerId: BUYER_ID,
      addressId: ADDRESS_ID,
      items: [
        {
          productId: PRODUCT_ID,
          price: 100, // Replace with actual price
          quantity: 1,
        },
      ],
      idempotencyKey: `test-uuid-${Date.now()}-${i}`, // Unique key for each request
    };

    requests.push(
      axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          Cookie: COOKIE,
        },
        validateStatus: () => true, // Don't throw for 400s
      })
    );
  }

  console.log(`📡 Sending ${concurrency} simultaneous orders...`);
  const responses = await Promise.all(requests);

  const successes = responses.filter((r) => r.status === 201).length;
  const outOfStocks = responses.filter((r) => r.status === 400 && r.data.message === "Out of Stock").length;
  const others = responses.length - successes - outOfStocks;

  console.log("\n📊 Test Results:");
  console.log(`✅ Successful Orders: ${successes}`);
  console.log(`❌ Out of Stock Responses: ${outOfStocks}`);
  if (others > 0) console.log(`⚠️ Other Responses: ${others}`);

  if (successes > 1) {
    console.error("❌ OVERSELLING DETECTED! Concurrency control failed.");
  } else {
    console.log("✨ Concurrency control working correctly.");
  }
}

// simulateConcurrentOrders();
console.log("Wait: To run this test, update the constants and run: npx ts-node test-concurrency.ts");
