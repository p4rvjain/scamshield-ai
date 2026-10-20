# ScamShield AI

ScamShield AI is a multimodal threat detection system designed to help users identify suspicious messages, URLs, and screenshots. It analyzes potential scam indicators, assigns a risk score, and presents findings through a cybersecurity-themed web interface. It includes a dedicated cybersecurity chatbot designed to answer queries exclusively related to cybersecurity. It helps users understand online threats, recognize suspicious activities, and learn about safe digital practices.

---

## Problem Statement

**Scam or Safe? — Multimodal Threat Detection & Explainable Security Engine**

Online scams often use urgent language, suspicious links, impersonation, and fake login pages to trick people into sharing sensitive information. Users may find it difficult to distinguish legitimate communication from phishing attempts.

ScamShield AI aims to provide an accessible first layer of security analysis by examining message content, URL patterns, and text extracted from screenshots, then presenting the detected warning signs and an estimated risk level.

---

## Features

### Message Analysis
- Analyzes suspicious SMS messages, emails, and other text.
- Checks for common warning signs such as urgency, account suspension threats, password requests, and suspicious links.
- Produces a risk score and risk classification.

### URL Analysis
- Accepts a URL for a separate risk assessment.
- Examines URL-related indicators, including suspicious address patterns and potentially unsafe destinations.
- Helps users understand why a link may deserve closer inspection.

### Screenshot Analysis
- Accepts screenshots of suspicious messages or pages.
- Uses OCR to extract readable text from the image.
- Analyzes the extracted content for potential scam indicators.

### Explainable Results
- Presents risk findings in a readable format.
- Helps users understand the signals contributing to a warning instead of relying only on a label.

### Web Interface
- React-based interface for submitting content and viewing results.
- Separate flows for message, URL, and screenshot analysis.
- Dark, cybersecurity-inspired visual design.

### Cybersecurity Chatbot
- Answers queries exclusively related to cybersecurity.
- Explains threats such as phishing, online scams, malicious URLs, and social engineering.
- Provides practical guidance on online safety and digital security.
- Redirects unrelated queries to keep responses focused on cybersecurity.

---

## Project Structure

```text
scamshield-ai/
│
├── backend/
│   ├── main.py                 # FastAPI application and API endpoints
│   ├── requirements.txt         # Python dependencies (if included)
│   └── ...                      # Analysis logic and supporting modules
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React application
│   │   ├── App.css              # Interface styling
│   │   └── ...                  # UI components and supporting files
│   ├── package.json             # Frontend dependencies and scripts
│   └── ...
│
└── README.md
```

*Note: File names may vary as the project evolves. The structure above describes the main application areas.*

---

## Installation & Requirements

Ensure the following are installed:

- Python 3.10+
- Node.js and npm
- Git

The backend uses FastAPI and Uvicorn. Screenshot analysis also requires the project's OCR and image-processing dependencies.

---

## Running the Project

### 1. Clone the repository

```bash
git clone https://github.com/p4rvjain/scamshield-ai.git
cd scamshield-ai
```

### 2. Set up the backend

Open a terminal in the project directory:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows Command Prompt**
```bat
venv\Scripts\activate
```

**macOS / Linux**
```bash
source venv/bin/activate
```

Install the backend dependencies using the repository's requirements file, if present:

```bash
pip install -r requirements.txt
```

If the repository does not contain `requirements.txt`, install the dependencies listed by the project instead. The core backend uses FastAPI and Uvicorn; screenshot analysis may require EasyOCR, Pillow, and `python-multipart`.

### 3. Start the backend server

From the `backend` directory, run:

```bash
python -m uvicorn main:app --reload --port 8000
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

Health endpoint:

```text
http://127.0.0.1:8000/api/health
```

Keep the backend terminal running.

### 4. Set up the frontend

Open a **new terminal** in the project directory:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal. In a standard Vite setup, this is usually:

```text
http://localhost:5173
```

Make sure the backend is running before testing analysis features.

---

## API Endpoints

The backend includes the following analysis routes:

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Checks whether the API is responding |
| `POST /api/scan` | Analyzes message or text content |
| `POST /api/scan-url` | Analyzes a submitted URL |
| `POST /api/scan-screenshot` | Extracts and analyzes text from a screenshot |

You can inspect request fields and responses through the interactive Swagger documentation at `http://127.0.0.1:8000/docs`.

---

## How It Works

1. The user submits a suspicious message, URL, or screenshot.
2. The backend routes the input to the corresponding analysis endpoint.
3. For screenshots, OCR extracts text from the uploaded image.
4. The analysis engine checks the available content for suspicious patterns and other risk indicators.
5. ScamShield calculates a risk score and assigns a risk category.
6. The frontend displays the result to help the user decide what to check next.

---

## Example Use Cases

- Checking a message claiming that a bank account will be suspended.
- Reviewing a URL that asks the user to verify account details.
- Analyzing a screenshot of a suspicious banking or login notification.
- Inspecting messages that pressure the recipient to act urgently or reveal sensitive information.

---

## Disclaimer

ScamShield AI is a prototype intended for educational and awareness purposes. Its results are estimates and are not a guarantee that content is safe or fraudulent. False positives and false negatives are possible.

Do not share passwords, OTPs, payment PINs, or other sensitive information with untrusted sources. Verify suspicious communications through the organisation's official website or independently obtained contact details. Do not rely on this tool as the sole basis for security decisions.

---

## Author

**Parv Jain**

Built for a 24 hour long hackathon as a multimodal scam detection and explainable security project.
