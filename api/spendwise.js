require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { expense, income, priority, alternatives, savings, spendingHabits } = req.body;

    if (!expense || !income || !priority || !alternatives || !savings || !spendingHabits) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    const prompt = `
    Act as a professional financial advisor...
    `;

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);

        if (
            result &&
            result.response &&
            result.response.candidates &&
            result.response.candidates[0] &&
            result.response.candidates[0].content
        ) {
            const content = result.response.candidates[0].content.text || result.response.candidates[0].content;
            res.json({ suggestion: content });
        } else {
            res.status(500).json({ error: "Failed to get a valid suggestion." });
        }
    } catch (error) {
        console.error("Error in /spendwise route:", error.message);
        res.status(500).json({ error: "Failed to fetch suggestion." });
    }
};
