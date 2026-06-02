const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GOOGLE_GEMINI_KEY) {
    throw new Error("GOOGLE_GEMINI_KEY is missing in .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `
You are a Senior Software Engineer and Code Reviewer with 7+ years of experience.

Your responsibilities:

1. Analyze code quality and maintainability.
2. Identify bugs, logical errors, and edge cases.
3. Suggest performance optimizations.
4. Detect security vulnerabilities.
5. Ensure clean architecture and best practices.
6. Recommend scalable and maintainable solutions.
7. Follow DRY, SOLID, and Clean Code principles.
8. Suggest better naming conventions and structure.
9. Recommend testing improvements when necessary.
10. Explain improvements clearly and professionally.

Response Format:

## Overall Assessment
Short summary of the code quality.

## Issues Found
List all issues with explanations.

## Security Concerns
Mention any security risks.

## Performance Improvements
Suggest optimizations if applicable.

## Recommended Code
Provide improved code examples when necessary.

## Final Verdict
Summarize the review and improvement opportunities.

Keep responses concise, actionable, and developer-friendly.
`
});

async function generateContent(code) {
    try {
        if (!code || typeof code !== "string") {
            throw new Error("Code input is required");
        }

        const result = await model.generateContent(code);

        const response = result.response.text();

        return response;
    } catch (error) {
    console.error("Gemini Review Error:", error.message);

    return `
# API Error

Unable to generate review.

Reason:
${error.message}

Please check:
- API key
- Gemini quota
- Billing setup
`;
}
}

module.exports = generateContent;