const express = require("express");
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const app = express();

const stripe = Stripe(process.env.STRIPE_SECRET);
app.use(express.json());
app.use(bodyParser.raw({ type: "application/json" }));

app.get("/", (req, res) => {
  res.send("Fireward Payments Backend Running!");
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { price, userId } = req.body;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Game coins for ${userId}` },
          unit_amount: price,
        },
        quantity: 1,
      }],
      success_url: `${process.env.BASE_URL}/success`,
      cancel_url: `${process.env.BASE_URL}/cancel`,
    });
    res.json({ id: session.id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/webhook", (req, res) => {
  console.log("Webhook received!");
  res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on port ${port}`));
