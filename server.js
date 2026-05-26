const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");

const app = express();

// Allow BOTH JSON and plain text from TradingView
app.use(bodyParser.json());
app.use(bodyParser.text());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

// WEBHOOK ENDPOINT
app.post("/webhook", async (req, res) => {

    try {

        console.log("Incoming webhook:");
        console.log(req.body);

        let message = "TradingView alert triggered";

        // CASE 1: TradingView sends plain text
        if (typeof req.body === "string") {

            message = req.body;
        }

        // CASE 2: TradingView sends JSON
        else if (typeof req.body === "object") {

            const signal = req.body.signal || "";
            const ticker = req.body.ticker || "";
            const price = req.body.price || "";

            // Build voice message dynamically
            if (signal || ticker || price) {

                message = `${signal} ${ticker} at ${price}`;
            }
        }

        // CLEAN UP MESSAGE
        message = message.replace(/"/g, "");

        console.log("Calling phone with message:");
        console.log(message);

        // TWILIO PHONE CALL
        await client.calls.create({

            twiml: `
                <Response>
                    <Say voice="alice">
                        ${message}
                    </Say>
                </Response>
            `,

            to: process.env.YOUR_PHONE_NUMBER,
            from: process.env.TWILIO_PHONE_NUMBER

        });

        console.log("Call initiated successfully");

        res.status(200).json({
            success: true,
            message: message
        });

    } catch (err) {

        console.error("Webhook error:");
        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ROOT ROUTE
app.get("/", (req, res) => {

    res.send("TradingView Twilio Webhook Server Running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);
});
