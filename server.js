const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");

const app = express();

app.use(bodyParser.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

app.post("/webhook", async (req, res) => {
    try {

        const signal = req.body.signal || "Trading Alert";

        await client.calls.create({
            twiml: `<Response><Say>${signal}</Say></Response>`,
            to: process.env.TWILIO_TO_NUMBER,
            from: process.env.TWILIO_FROM_NUMBER

        });

        console.log("Call initiated");

        res.send("Success");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
