

import { useEffect, useState, type ChangeEvent } from "react";

import "./App.css";
import Academy from "./components/Academy";
import ThreatResults, {
  type ScanResult,
} from "./components/ThreatResults";

type ScanTab = "message" | "url" | "screenshot";

function App() {
  const [currentPage, setCurrentPage] = useState<"analysis" | "academy">("analysis");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  
const [loadingStage, setLoadingStage] = useState(0);

useEffect(() => {
  if (!loading) {
    setLoadingStage(0);
    return;
  }

  const interval = window.setInterval(() => {
    setLoadingStage((current) => Math.min(current + 1, 3));
  }, 2500);

  return () => window.clearInterval(interval);
}, [loading]);

const loadingMessages = [
  "Preparing threat analysis...",
  "Checking suspicious patterns and risk indicators...",
  "Waiting for AI assessment...",
  "Finalizing the investigation report...",
];

  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [activeTab, setActiveTab] = useState<ScanTab>("message");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");

  function switchTab(tab: ScanTab) {
    if (loading) return;

    setActiveTab(tab);
    setMessage("");
    setResult("");
    setScanData(null);
    setSelectedFile(null);
    setExtractedText("");
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;

    setResult("");
    setScanData(null);
    setExtractedText("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);
      setResult("Please upload a PNG, JPG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);
      setResult("Screenshot must be smaller than 5 MB.");
      return;
    }

    setSelectedFile(file);
  }

  async function analyzeMessage() {
    if (activeTab === "screenshot" && !selectedFile) {
      setResult("Please select a screenshot first.");
      return;
    }

    if (activeTab !== "screenshot" && !message.trim()) {
      setResult(
        activeTab === "url"
          ? "Please enter a URL first."
          : "Please enter a message first."
      );
      return;
    }

    setLoading(true);
    setResult("");
    setScanData(null);
    setExtractedText("");

    try {
      let response: Response;

      if (activeTab === "screenshot") {
        const formData = new FormData();
        formData.append("file", selectedFile!);

        response = await fetch(
          "http://127.0.0.1:8000/api/scan-screenshot",
          {
            method: "POST",
            body: formData,
          }
        );
      } else {
        

const endpoint =
  activeTab === "url"
    ? "http://127.0.0.1:8000/api/scan-url-hybrid"
    : "http://127.0.0.1:8000/api/scan-hybrid";



        const requestBody =
          activeTab === "url"
            ? { url: message.trim() }
            : { message };

        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
      }

      if (!response.ok) {
        let errorMessage = `Analysis failed (HTTP ${response.status}).`;

        try {
          const errorData = await response.json();

          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          }
        } catch {
          // Keep default error message
        }

        throw new Error(errorMessage);
      }

      const data: ScanResult & {
        extracted_text?: string;
      } = await response.json();

      setScanData(data);
      setExtractedText(data.extracted_text ?? "");
    } catch (error) {
      console.error("Scan failed:", error);

      if (error instanceof TypeError) {
        setResult(
          "Connection failed. Make sure the Python backend is running on port 8000."
        );
      } else {
        setResult(
          error instanceof Error
            ? error.message
            : "Something went wrong during analysis."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function navigateTo(page: "analysis" | "academy") {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app" id="top">
      <header className="navbar">
        <button type="button" className="brand brand-nav-button" onClick={() => navigateTo("analysis")} aria-label="ScamShield AI — home">
          <span className="brand-icon">⬡</span>
          SCAM<span>SHIELD</span>
          <small>AI</small>
        </button>

        <nav className="site-nav" aria-label="Main navigation">
          <button type="button" className={`site-nav-link ${currentPage === "analysis" ? "is-current" : ""}`} onClick={() => { navigateTo("analysis"); }}>01 / THREAT ANALYSIS</button>
          <button type="button" className={`site-nav-link ${currentPage === "academy" ? "is-current" : ""}`} onClick={() => navigateTo("academy")}>02 / ACADEMY</button>
        </nav>

        <div className="nav-status">
          <span className="status-dot"></span>
          SYSTEM ONLINE
        </div>
      </header>

      <main className="main">
        {currentPage === "analysis" ? (
          <>
        <div className="hero-meta">
          <span className="eyebrow">[ 001 / DIGITAL DEFENSE SYSTEM ]</span>
          <span className="hero-edition">EST. 2026 — THE ANTI-DECEPTION PROJECT</span>
        </div>

        <div className="hero-composition">
          <div className="hero-copy">
            <h1 className="hero-title">
              <span className="hero-line">DECEPTION</span>
              <span className="hero-line">LOOKS REAL<span className="hero-period">.</span></span>
              <span className="hero-highlight">WE SEE THROUGH IT<span className="hero-highlight-dot">.</span></span>
            </h1>
            <p className="subtitle">
              Spot the scams hiding in plain sight. Analyze suspicious messages,
              links, and screenshots with AI-powered intelligence.
            </p>
            <div className="hero-footnote">
              <span className="hero-footnote-marker">↳</span>
              <span>SCROLL TO INVESTIGATE</span>
              <span className="hero-footnote-rule" />
              <span>NO TRUST WITHOUT VERIFICATION</span>
            </div>
          </div>
          <div className="hero-side-mark" aria-hidden="true">
            <span>SS—01</span>
            <span>IDENTIFY / ANALYZE / DEFEND</span>
          </div>
        </div>

        <section className="scanner" id="threat-analysis">
          <div className="scanner-header">
            <span>[ 01 ] / THREAT ANALYSIS TERMINAL</span>
            <span className="scanner-version">SCANNER / V1.0</span>
          </div>

          <div className="scanner-body">
            <div className="tabs">
              <button
                type="button"
                className={
                  activeTab === "message" ? "active" : ""
                }
                onClick={() => switchTab("message")}
                disabled={loading}
              >
                MESSAGE
              </button>

              <button
                type="button"
                className={
                  activeTab === "url" ? "active" : ""
                }
                onClick={() => switchTab("url")}
                disabled={loading}
              >
                URL
              </button>

              <button
                type="button"
                className={
                  activeTab === "screenshot" ? "active" : ""
                }
                onClick={() => switchTab("screenshot")}
                disabled={loading}
              >
                SCREENSHOT
              </button>
            </div>

            {activeTab === "screenshot" ? (
              <>
                <label htmlFor="screenshot">
                  UPLOAD SUSPICIOUS SCREENSHOT
                </label>

                <div className="screenshot-upload">
                  <input
                    id="screenshot"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    disabled={loading}
                  />

                  <p>
                    PNG, JPG or WEBP · Maximum 5 MB
                  </p>

                  {selectedFile && (
                    <p className="selected-file">
                      ✓ Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <label htmlFor="message">
                  {activeTab === "url"
                    ? "ENTER SUSPICIOUS URL"
                    : "ENTER SUSPICIOUS CONTENT"}
                </label>

                <textarea
                  id="message"
                  placeholder={
                    activeTab === "url"
                      ? "Paste a suspicious URL here..."
                      : "Paste a suspicious SMS, email or job offer here..."
                  }
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  disabled={loading}
                />
              </>
            )}

            <div className="scanner-footer">
              <span>
                LOCAL ANALYSIS INTERFACE · AI ASSISTED
              </span>

              
<button
  type="button"
  className={`analyze-btn ${loading ? "is-scanning" : ""}`}
  onClick={analyzeMessage}
  disabled={loading}
  aria-busy={loading}
>
  {loading ? (
    <span className="scan-loading-content">
      <span className="scan-spinner" aria-hidden="true" />
      <span>SCANNING THREAT...</span>
    </span>
  ) : activeTab === "screenshot" ? (
    "SCAN SCREENSHOT →"
  ) : activeTab === "url" ? (
    "ANALYZE URL →"
  ) : (
    "ANALYZE THREAT →"
  )}
</button>

            </div>

{loading && (
  <div className="scan-progress-panel" role="status" aria-live="polite">
    <div className="scan-progress-heading">
      <span className="scan-progress-icon">◈</span>
      THREAT ANALYSIS IN PROGRESS
    </div>

    
<p className="scan-progress-description">
  {loadingMessages[loadingStage]}
</p>


    <div className="scan-progress-track">
      <div className="scan-progress-bar" />
    </div>

    <div className="scan-progress-footer">
      SCAMSHIELD AI // PROCESSING REQUEST
    </div>
  </div>
)}

            {result && (
              <div className="result" role="alert">
                {result}
              </div>
            )}
          </div>
        </section>
        
{scanData && !loading && (
  <div className="new-scan-container">
    <button
      type="button"
      className="new-scan-btn"
      onClick={() => {
        setScanData(null);
        setMessage("");
        setExtractedText("");
        setSelectedFile(null);
        setResult("");
      }}
    >
      ↻ NEW SCAN
    </button>
  </div>
)}

        {scanData && (
          <>
            <ThreatResults data={scanData} />
            


{"summary" in scanData &&
  typeof scanData.summary === "string" && (


    <section className="ai-insights">
      <div className="ai-insights-header">
        <span>✦ GEMINI AI INTELLIGENCE</span>
        <span className="ai-insights-status">
          ANALYSIS REPORT
        </span>
      </div>

      <div className="ai-insights-body">
        <div className="ai-insight-block">
          <span className="ai-insight-label">
            ◈ AI ASSESSMENT
          </span>
          <p>{scanData.summary}</p>
        </div>

        {"scam_type" in scanData &&
          typeof scanData.scam_type === "string" && (
            <div className="ai-insight-block">
              <span className="ai-insight-label">
                ◈ DETECTED SCAM CATEGORY
              </span>
              <div className="scam-type-tag">
                {scanData.scam_type}
              </div>
            </div>
          )}


        {"analysis_mode" in scanData &&
          typeof scanData.analysis_mode ===
            "string" && (
            <div className="ai-insights-footer">
              ANALYSIS ENGINE:{" "}
              {scanData.analysis_mode === "hybrid"
                ? "GEMINI + RULE-BASED"
                : "RULE-BASED FALLBACK"}
            </div>
          )}
      </div>
    </section>
  )}

            {activeTab === "screenshot" && (
              <section className="ocr-output">
                <h3>EXTRACTED TEXT</h3>
                <pre>
                  {extractedText ||
                    "No readable text was detected."}
                </pre>
              </section>
            )}
          </>
        )}

        <div className="features">
          <div>01 / MULTIMODAL DETECTION</div>
          <div>02 / AI-POWERED ANALYSIS</div>
          <div>03 / EXPLAINABLE RESULTS</div>
        </div>
          </>
        ) : (
        <Academy />
        )}
      </main>
    </div>
  );
}

export default App;
