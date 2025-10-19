const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
require("dotenv").config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET);

app.use(cors({ origin: ["https://firewardgames.com", "https://preview.p5js.org"] }));
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { price, userId } = req.body;
    console.log("🔹 Incoming body:", req.body);
    console.log("🔹 Environment:", process.env.BASE_URL);

    const success = `https://${process.env.BASE_URL}/success`;
    const cancel = `https://${process.env.BASE_URL}/cancel`;
    console.log("🔹 Success URL:", success);
    console.log("🔹 Cancel URL:", cancel);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Coins for ${userId}` },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      success_url: success,
      cancel_url: cancel,
    });

    console.log("✅ Created session:", session.id);
    res.json({ id: session.id });
  } catch (err) {
    console.error("❌ Stripe failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
