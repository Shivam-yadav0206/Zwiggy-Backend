import express from "express";
import dotenv from "dotenv";
import stripe from "stripe";
import cors from "cors";

dotenv.config();

const app = express();


app.use(cors());
app.use(express.static("public"));
app.use(express.json());
const PORT = process.env.PORT || 7000;


app.get("/", (req, res) => {
  res.send("Welcome");
});

let stripeGateway = stripe(process.env.STRIPE_API);

app.post("/stripe-checkout", async (req, res) => {
  try {
    const { items } = req.body;

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "INR", // Set currency to INR
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: item.price * 100, // Convert price to cents
      },
      quantity: item.quantity,
    }));

    console.log("line Items", lineItems);

    const session = await stripeGateway.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.DOMAIN}/success`,
      cancel_url: `${process.env.DOMAIN}/cancel`,
      line_items: lineItems,
      // Asking for Address
      billing_address_collection: "required",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

app.listen(PORT, () => {
  console.log("listening on port", PORT);
});
