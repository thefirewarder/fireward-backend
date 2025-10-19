const cors = require("cors");
const express = require("express");
const Stripe = require("stripe");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET);

// --- FIX START ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // for testing, allow all
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
// --- FIX END ---

app.use(express.json());

// ✅ this must exist:
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { price, userId } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Coins for ${userId}` },
          unit_amount: price
        },
        quantity: 1
      }],
      success_url: `https://${process.env.BASE_URL}/success`,
      cancel_url: `https://${process.env.BASE_URL}/cancel`
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// optional: a simple test route
app.get("/", (req, res) => {
  res.send("🔥 Fireward backend is running");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
