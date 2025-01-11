require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const API_KEY = process.env.GEMINI_API_KEY;
console.log("API Key:", API_KEY);

// Endpoint for SpendWise
app.post("/spendwise", async (req, res) => {
    const { expense } = req.body;

    if (!expense) {
        return res.status(400).json({ error: "Expense input is required." });
    }

    const prompt = `
    Act as a professional financial advisor.
    The user has entered the following expense: "${expense}".
    Provide:
    1. Suggestions on how the user can manage their spending more wisely.
    2. Alternative budget-friendly approaches or substitutions for the mentioned expense.
    3. Insights on how this expense impacts long-term financial goals and how to better align it with savings or financial stability.
    4. Practical tips or habits to develop better financial discipline related to such expenses.
    `;

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("SpendWise Prompt:", prompt);
        const result = await model.generateContent(prompt);

        // Log the entire result for debugging
        console.log("SpendWise API Result:", JSON.stringify(result, null, 2));
        
        // Check if the response structure contains the expected content
        if (
            result &&
            result.response &&
            result.response.candidates &&
            result.response.candidates[0] &&
            result.response.candidates[0].content
        ) {
            // Extracting the content text properly
            const content = result.response.candidates[0].content.text || result.response.candidates[0].content;
        
            // Send the content (text) to the client
            res.json({ suggestion: content });
        } else {
            // If the structure is different, handle accordingly
            console.error("Invalid SpendWise API Response:", result);
            res.status(500).json({ error: "Failed to get a valid suggestion." });
        }        
      
    } catch (error) {
        console.error("Error in /spendwise route:", error.message);
        res.status(500).json({ error: "Failed to fetch suggestion. Check server logs for details." });
    }
});

// Endpoint for InvestWise
app.post("/investwise", async (req, res) => {
    const { age, goal, riskTolerance } = req.body;

    if (!age || !goal || !riskTolerance) {
        return res.status(400).json({ error: "Age, goal, and risk tolerance are required inputs." });
    }

    const prompt = `
    Act as a professional financial advisor, but don't make your response like you are in a meeting.
    The user is ${age} years old, with an investment goal of "${goal}", and a risk tolerance level of "${riskTolerance}".
    Provide:
    1. A tailored investment plan (e.g., mutual funds, stocks, or bonds).
    2. A detailed risk analysis that evaluates:
       - Potential risks specific to the user's age and risk tolerance.
       - How these risks might impact achieving their investment goal.
       - Recommendations to mitigate these risks without compromising the goal.
    `;

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("InvestWise Prompt:", prompt);
        const result = await model.generateContent(prompt);
        console.log("InvestWise API Result:", JSON.stringify(result, null, 2));

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
            console.error("Invalid InvestWise API Response:", result);
            res.status(500).json({ error: "Failed to get a valid suggestion." });
        }
    } catch (error) {
        console.error("Error in /investwise route:", error.message);
        res.status(500).json({ error: "Failed to fetch suggestion. Check server logs for details." });
    }
});

app.post("/loanwise", async (req, res) => {
    const { loanPurpose, loanAmount, monthlyIncome, repaymentCapacity, loanTerm, interestRate } = req.body;

    // Validate inputs
    if (!loanPurpose || !loanAmount || !monthlyIncome || !repaymentCapacity || !loanTerm || !interestRate) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const prompt = `
    Act as a financial expert providing loan advice.
    The user provided the following details:
    - Loan Purpose: "${loanPurpose}"
    - Loan Amount: ${loanAmount}
    - Monthly Income: ${monthlyIncome}
    - Repayment Capacity: ${repaymentCapacity}
    - Loan Term: ${loanTerm} months
    - Interest Rate: ${interestRate}%
    
    Provide:
    1. A recommendation on whether the loan amount is suitable based on their monthly income and repayment capacity.
    2. Suggestions for the most appropriate loan term and type of loan (e.g., personal loan, mortgage).
    3. Tips for minimizing interest payments and ensuring financial stability while repaying the loan.
    4. Advice on alternatives if the loan appears financially risky.
    `;

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);

        if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const suggestion = result.response.candidates[0].content.parts[0].text;
            res.json({ suggestion });
        } else {
            console.error("Invalid LoanWise API Response:", result);
            res.status(500).json({ error: "Failed to get a valid suggestion." });
        }
    } catch (error) {
        console.error("Error in /loanwise route:", error.message);
        res.status(500).json({ error: "Failed to fetch suggestion. Check server logs for details." });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
    res.send("Server is running!");
});