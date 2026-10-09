
import { useEffect, useState } from "react";
import "./ThreatResults.css";

export type Evidence = {
  title: string;
  explanation: string;
  severity: "high" | "medium" | "low";
};


export type ScanResult = {
  risk_score: number;
  verdict: string;
  evidence: Evidence[];
  disclaimer: string;
  recommended_action?: string;
};


type Props = {
  data: ScanResult;
};

export default function ThreatResults({ data }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const score = Math.max(0, Math.min(100, data.risk_score));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAnimatedScore(score);
    }, 100);

    return () => window.clearTimeout(timeout);
  }, [score]);

  const isHigh = data.verdict === "high_risk";
  const isMedium = data.verdict === "suspicious";

  const color = isHigh
    ? "#ff4655"
    : isMedium
    ? "#f5ae52"
    : "#43d99b";

  const label = isHigh
    ? "HIGH RISK"
    : isMedium
    ? "SUSPICIOUS"
    : "LOW DETECTED RISK";

  const circumference = 2 * Math.PI * 76;
  const offset =
    circumference - (animatedScore / 100) * circumference;

  return (
    <section className="threat-dashboard">
      <div className="threat-topbar">
        <span>◈ INVESTIGATION REPORT</span>
        <span className="report-status">● ANALYSIS COMPLETE</span>
      </div>

      <div className="threat-overview">
        <div className="risk-circle">
          <svg viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke="#292b32"
              strokeWidth="11"
            />
            <circle
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke={color}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 100 100)"
              style={{
                transition:
                  "stroke-dashoffset 1.3s ease-out",
              }}
            />
          </svg>

          <div className="risk-number">
            <strong>{animatedScore}</strong>
            <span>/ 100</span>
          </div>
        </div>

        <div className="risk-summary">
          <div className="summary-eyebrow">
            THREAT ASSESSMENT
          </div>

          <h2 style={{ color }}>{label}</h2>

         
<p>
  {isHigh
    ? "Multiple warning signs were detected. Avoid interacting with suspicious content until you independently verify its source."
    : isMedium
    ? "Some suspicious indicators were identified. Verify the source and destination before taking action."
    : "No major warning signs were detected by the current checks. This does not guarantee safety."}
</p>

          <div className="signal-count">
            <span className="signal-dot"></span>
            {data.evidence.length} SECURITY SIGNALS IDENTIFIED
          </div>
        </div>
      </div>

      <div className="evidence-section">
        <div className="evidence-heading">
          <h3>Detected Evidence</h3>
          <span>{data.evidence.length} FINDINGS</span>
        </div>

        
<div className="evidence-grid">
  {data.evidence.length === 0 ? (
    <div className="evidence-empty">
      <div className="evidence-empty-icon">◇</div>
      <h4>NO WARNING SIGNALS DETECTED</h4>
      <p>
        The current checks did not identify suspicious
        patterns. This does not guarantee safety.
      </p>
    </div>
  ) : (
    data.evidence.map((item, index) => (

            <div
              className="evidence-card"
              key={`${item.title}-${index}`}
              style={{
                animationDelay: `${index * 120}ms`,
              }}
            >
              <div className="evidence-card-top">
                <span className="evidence-index">
                  0{index + 1}
                </span>
                <span
                  className={`severity severity-${item.severity}`}
                >
                  {item.severity.toUpperCase()}
                </span>
              </div>

              <h4>{item.title}</h4>
              <p>{item.explanation}</p>
            </div>
          ))
          )}
        </div>
      </div>

      
<div className="safety-recommendation">
  <div className="recommendation-icon">⚑</div>
  <div>
    <h4>RECOMMENDED ACTION</h4>
    <p>
      {data.recommended_action?.trim()
        ? data.recommended_action
        : isHigh
        ? "Do not click suspicious links, share credentials, or send money. Contact the organization through its official website or app."
        : isMedium
        ? "Verify the sender and website independently before sharing information or making payments."
        : "Remain cautious. This preliminary scan cannot establish that a message or website is legitimate."}
    </p>
  </div>
</div>


      <div className="report-footer">
        <span>SCAMSHIELD AI // THREAT INTELLIGENCE</span>
        <span>{data.disclaimer}</span>
      </div>
    </section>
  );
}
