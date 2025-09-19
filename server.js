// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for JSON responses
app.use(express.json());

// Proxy route to fetch Steam Market listing prices
app.get("/api/price", async (req, res) => {
  try {
    const { appid = "730", name, currency = "1" } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Missing ?name parameter" });
    }

    // Build Steam Market API URL
    const url = `https://steamcommunity.com/market/listings/${appid}/${encodeURIComponent(
      name
    )}/render?currency=${currency}&format=json`;

    console.log("🔍 Fetching:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Steam API responded with ${response.status}`);
    }

    const data = await response.json();

    // Extract lowest price
    let price = null;
    if (data?.lowest_price) {
      price = parseFloat(
        data.lowest_price.replace(/[^0-9.,]/g, "").replace(",", "")
      );
    }

    res.json({
      success: true,
      appid,
      name,
      currency,
      price,
      raw: data, // full data in case frontend needs more info
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch price" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Proxy server running at http://localhost:${PORT}`);
});
