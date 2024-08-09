const express = require('express');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(fileUpload());

//Google Generative AI API key
//console.log("apiKey", process.env.API_KEY);
const genAi = new GoogleGenerativeAI(process.env.API_KEY);

// Setting Generative Model
const geminiModel = genAi.getGenerativeModel({ model: "gemini-1.5-pro" });

// api route for Upload
app.post('/upload', async (req, res) => {
  console.log('Upload endpoint hit');
  
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log('No files were uploaded.');
    return res.status(400).send('No files were uploaded.');
  }

  try {
    const dataBuffer = req.files.pdf.data;
    const data = await pdfParse(dataBuffer);
    const extractedText = data.text;
    console.log('PDF parsed successfully');
    console.log("extractedText: Yes");

    // Defiinig Prompt
    const prompt = `
      Extract the following details from the text:
      1. Total Amount
      2. Customer Details (Name, Address, Contact)
      3. Product Details (Product Name, Quantity, Amount)

      Text:
      ${extractedText}
    `;

    // Generating COntent Using Prompt
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();  // Awaiting the response text
    console.log("Extracted Info:");

    // Return the Extracted Imformatiojn to Client
    res.json({ extractedInfo: text.trim() });
  } catch (error) {
    console.log('Error processing the request:', error);
    res.status(500).send('Failed to process the request.');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
