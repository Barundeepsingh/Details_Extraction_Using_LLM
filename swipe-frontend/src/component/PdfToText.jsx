import React, { useState } from 'react';
import axios from 'axios';
import './PdfToText.css';

function PDFUploader() {
  const [extractedInfo, setExtractedInfo] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setExtractedInfo(''); // Clear previous result
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file to upload.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Cleaning the extracted text
      let cleanedText = response.data.extractedInfo
        .replace(/\*\*/g, '') 
        .replace(/\*/g, '');

      setExtractedInfo(cleanedText);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload the file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Upload a PDF to Extract Text</h1>
      <div className="upload-box" onClick={() => document.getElementById('fileInput').click()}>
        <input
          type="file"
          id="fileInput"
          onChange={handleFileChange}
          accept="application/pdf"
        />
        {selectedFile ? <p>{selectedFile.name}</p> : <p>Click to select a file</p>}
      </div>
      <button onClick={handleUpload} disabled={!selectedFile || isLoading}>
        {isLoading ? 'Processing...' : 'Upload and Extract Text'}
      </button>
      {isLoading && <div className="loader"></div>}
      {extractedInfo && (
        <div className="result">
          <h2>Extracted Result</h2>
          <pre>{extractedInfo}</pre>
        </div>
      )}
    </div>
  );
}

export default PDFUploader;
