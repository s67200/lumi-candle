export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Missing message"
      });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token) {
      return res.status(500).json({
        error: "TELEGRAM_BOT_TOKEN is missing"
      });
    }

    if (!chatId) {
      return res.status(500).json({
        error: "TELEGRAM_CHAT_ID is missing"
      });
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

    const data = await response.json();

    console.log("TELEGRAM STATUS:", response.status);
    console.log("TELEGRAM RESPONSE:", data);

    if (!response.ok || !data.ok) {
      return res.status(500).json({
        error: data.description || "Telegram API error",
        telegram: data
      });
    }

    return res.status(200).json({
      ok: true
    });

  } catch (error) {
    console.error("TELEGRAM ERROR:", error);

    return res.status(500).json({
      error: error.message
    });
  }
}
