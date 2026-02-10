require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const EMAIL = process.env.OFFICIAL_EMAIL;

/* ---------------- HELPER FUNCTIONS ---------------- */

function fibonacci(n) {
  const res = [];
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    res.push(a);
    [a, b] = [b, a + b];
  }
  return res;
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function hcf(arr) {
  return arr.reduce((a, b) => gcd(a, b));
}

function lcm(arr) {
  return arr.reduce((a, b) => (a * b) / gcd(a, b));
}

/* ---------------- ROUTES ---------------- */

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

// MAIN API
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    let data;

    if (body.fibonacci !== undefined) {
      if (!Number.isInteger(body.fibonacci) || body.fibonacci < 0)
        return res.status(400).json({ is_success: false });

      data = fibonacci(body.fibonacci);
    }

    else if (body.prime !== undefined) {
      if (!Array.isArray(body.prime))
        return res.status(400).json({ is_success: false });

      data = body.prime.filter(isPrime);
    }

    else if (body.lcm !== undefined) {
      if (!Array.isArray(body.lcm))
        return res.status(400).json({ is_success: false });

      data = lcm(body.lcm);
    }

    else if (body.hcf !== undefined) {
      if (!Array.isArray(body.hcf))
        return res.status(400).json({ is_success: false });

      data = hcf(body.hcf);
    }

    else if (body.AI !== undefined) {
      if (typeof body.AI !== "string")
        return res.status(400).json({ is_success: false });

      // Gemini API call
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: body.AI }] }]
        }
      );

      data =
        response.data.candidates[0].content.parts[0].text
          .split(" ")[0]
          .replace(/[^a-zA-Z]/g, "");
    }

    else {
      return res.status(400).json({ is_success: false });
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data
    });

  } catch (err) {
    res.status(500).json({
      is_success: false
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
