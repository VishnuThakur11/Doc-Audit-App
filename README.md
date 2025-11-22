# Document Auditor App

A **React + Node.js + MongoDB** application that allows you to upload PDF documents and automatically audit them against customizable rules using AI (Google Gemini).  

<img width="1470" height="956" alt="Screenshot 2025-11-23 at 1 19 04 AM" src="https://github.com/user-attachments/assets/7201ca0d-0578-4819-b8d8-d8b7830d317b" />



---

## Features

- Upload PDF documents directly from your browser.  
- Extract text from PDFs locally (client-side) using PDF.js.  
- Define custom audit rules.  
- Analyze document compliance using AI (Google Gemini).  
- View audit results with confidence scores, evidence, and reasoning.  
- Store audit history in MongoDB.  

---

## Tech Stack

- **Frontend:** React, TailwindCSS, PDF.js  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose)  
- **AI:** Google Gemini API  

---

## Installation

### Backend

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/document-auditor.git
   cd document-auditor/backend
