const express = require('express');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Tesseract = require('tesseract.js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(fileUpload());

// Google Generative AI API key
//console.log("apiKey", process.env.API_KEY);
const genAi = new GoogleGenerativeAI(process.env.API_KEY);

// Setting Generative Model
const geminiModel = genAi.getGenerativeModel({ model: "gemini-1.5-pro" });

// API route for Upload
app.post('/upload', async (req, res) => {
  console.log('Upload endpoint hit');
  
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log('No files were uploaded.');
    return res.status(400).send('No files were uploaded.');
  }

  try {
    let extractedText = '';

    // Check if the uploaded file is a PDF or an image
    const file = req.files.file;
    if (file.mimetype === 'application/pdf') {
      const dataBuffer = file.data;
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
      console.log('PDF parsed successfully');
    } else if (file.mimetype.startsWith('image/')) {
      const imageBuffer = file.data;
      const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
      extractedText = text;
      console.log('Image parsed successfully');
    } else {
      return res.status(400).send('Unsupported file type.');
    }

    console.log("extractedText: Yes");

    // Define the Prompt
    const prompt = `
      Extract the following details from the text:
      1. Total Amount
      2. Customer Details (Name, Address, Contact)
      3. Product Details (Product Name, Quantity, Amount)

      Text:
      ${extractedText}
    `;

    // Generating Content Using Prompt
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const textResult = await response.text();  // Awaiting the response text
    console.log("Extracted Info:");

    // Return the Extracted Information to Client
    res.json({ extractedInfo: textResult.trim() });
  } catch (error) {
    console.log('Error processing the request:', error);
    res.status(500).send('Failed to process the request.');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
