const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET);

app.use(cors({ origin: "https://firewardgames.com" })); // allow your main site
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
