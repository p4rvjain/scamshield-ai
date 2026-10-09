import { API_URL } from "../config";
import { useEffect, useState, type FormEvent } from 'react';
import './Academy.css';
import ReactMarkdown from 'react-markdown';
type Mode = 'spot' | 'url' | 'quiz' | 'coach';
type Question = { id: string; category: Mode; title: string; content: string; options: string[]; correct: number; explanation: string; tip: string };
type Chat = { role: 'user' | 'assistant'; text: string };
const questions: Question[] = [
  { id:'s1', category:'spot', title:'The urgent bank alert', content:'SMS: Your bank account will be BLOCKED in 15 minutes. Verify your OTP at bank-secure-verify.example.com to prevent suspension.', options:['Legitimate notification','Likely phishing attempt','Not enough information'], correct:1, explanation:'Urgency, a request for an OTP, and an unofficial verification domain are strong warning signs. Banks should not ask you to share an OTP.', tip:'Never share OTPs. Contact the bank using its official app or number.' },
  { id:'s2', category:'spot', title:'The recruiter', content:'Hi! You are selected for a remote job. Earn ₹5,000 daily. Pay a ₹999 registration fee today to secure your position.', options:['Normal hiring process','Likely job scam','Definitely legitimate'], correct:1, explanation:'Upfront fees combined with unrealistic earnings are common job-scam signals.', tip:'Research employers independently and do not pay to receive a job offer.' },
  { id:'s3', category:'spot', title:'The routine update', content:'Your college has posted the revised timetable on the official student portal. Sign in through your usual saved bookmark to view it.', options:['Clearly malicious','No obvious scam indicators','You must forward it'], correct:1, explanation:'This message does not demand payment, credentials in a new location, or immediate action. Authenticity still depends on the sender and portal.', tip:'Use a known bookmark rather than following an unexpected link.' },
  { id:'u1', category:'url', title:'Which domain is the real one?', content:'A login page claims to be from PayPal. Inspect the domain carefully.', options:['paypal.com.security-check.example.com','www.paypal.com','paypal-login-security.example.com'], correct:1, explanation:'In a hostname, the registrable domain matters. The first URL belongs to example.com, not paypal.com. The third is also not the official PayPal domain.', tip:'Read the domain from right to left. A brand name at the start is not proof of ownership.' },
  { id:'u2', category:'url', title:'The padlock myth', content:'A website uses HTTPS and shows a padlock. What can you conclude?', options:['It must be safe','It encrypts the connection, but may still be a scam','It is officially approved by your bank'], correct:1, explanation:'HTTPS protects data in transit. Fraudulent websites can also use HTTPS.', tip:'Check the exact domain and context, not just the padlock.' },
  { id:'u3', category:'url', title:'A shortened link', content:'A stranger sends a short URL and asks you to log in to collect a reward.', options:['Trust it because it is short','Open it and enter your password','Verify the destination independently first'], correct:2, explanation:'Shortened URLs hide the final destination. Unexpected login requests make verification especially important.', tip:'Navigate to the service through its official website or app.' },
  { id:'q1', category:'quiz', title:'Two-factor authentication', content:'What is the main benefit of enabling 2FA?', options:['It makes passwords unnecessary everywhere','It adds another verification step','It prevents every possible scam'], correct:1, explanation:'2FA adds a second factor, reducing the impact of a stolen password, although phishing-resistant methods are stronger.', tip:'Prefer passkeys or authenticator apps when supported.' },
  { id:'q2', category:'quiz', title:'A suspicious attachment', content:'An unexpected email contains an invoice attachment. What should you do?', options:['Open it immediately','Forward it to everyone','Verify the sender through a separate channel'], correct:2, explanation:'Unexpected attachments can carry malware. Independently verify the sender before opening them.', tip:'Do not enable macros in documents from untrusted senders.' },
  { id:'q3', category:'quiz', title:'Password hygiene', content:'Which password strategy is strongest?', options:['Reuse one complex password','Use unique passwords managed by a password manager','Use your birthday with symbols'], correct:1, explanation:'Unique passwords prevent one compromised account from exposing all the others.', tip:'Use a password manager and enable MFA.' },
];
const modeInfo: Record<Mode,{num:string; title:string; description:string; icon:string}> = {
  spot:{num:'01',title:'SPOT THE SCAM',description:'Read real-world scenarios and make the call.',icon:'◈'},
  url:{num:'02',title:'URL DETECTIVE',description:'Unmask impersonation and deceptive links.',icon:'⌁'},
  quiz:{num:'03',title:'CYBER IQ',description:'Build stronger everyday security habits.',icon:'◇'},
  coach:{num:'04',title:'AI SAFETY COACH',description:'Ask questions. Learn how attacks work.',icon:'✳'},
};
const STORAGE_KEY='scamshield-academy-v1';
const readProgress=():string[]=>{try {const raw=localStorage.getItem(STORAGE_KEY);const val=raw?JSON.parse(raw):[];return Array.isArray(val)?val.filter((x):x is string=>typeof x==='string'):[];}catch{return [];}};

export default function Academy(){
  const [mode,setMode]=useState<Mode|null>(null);
  const [completed,setCompleted]=useState<string[]>(readProgress);
  const [index,setIndex]=useState(0);
  const [answer,setAnswer]=useState<number|null>(null);
  const [messages,setMessages]=useState<Chat[]>([{role:'assistant',text:'Welcome to the Academy. Ask me about phishing, passwords, OTPs, privacy, or how to verify a suspicious message. Never paste real passwords or OTPs.'}]);
  const [draft,setDraft]=useState('');
  const [busy,setBusy]=useState(false);
  const [chatError,setChatError]=useState('');
  useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(completed));}catch{/* Storage may be unavailable */}},[completed]);
  const xp=completed.length*100;
  const level=Math.floor(xp/300)+1;
  const levelProgress=xp%300;
  const activeQuestions=questions.filter(q=>q.category===mode);
  const question=activeQuestions[index];
  function openMode(next:Mode){setMode(next);setIndex(0);setAnswer(null);}
  function submitAnswer(option:number){if(answer!==null||!question)return;setAnswer(option);if(option===question.correct)setCompleted(old=>old.includes(question.id)?old:[...old,question.id]);}
  function nextQuestion(){setAnswer(null);setIndex(i=>(i+1)%activeQuestions.length);}
  async function sendMessage(event:FormEvent){event.preventDefault();const content=draft.trim();if(!content||busy)return;const next:Chat[]=[...messages,{role:'user',text:content}];setMessages(next);setDraft('');setBusy(true);setChatError('');try{const response=await fetch(`${API_URL}/api/academy/coach`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:content,history:next.slice(-9,-1)})});const data=await response.json();if(!response.ok)throw new Error(typeof data.detail==='string'?data.detail:'Coach unavailable');setMessages(prev=>[...prev,{role:'assistant',text:data.reply}]);}catch(err){setChatError(err instanceof Error?err.message:'Could not reach the coach.');}finally{setBusy(false);}}
  return <section className="academy" id="academy" aria-labelledby="academy-title">
    <div className="academy-topline"><span>[ 002 / CYBER DEFENSE TRAINING ]</span><span>ACADEMY // LIVE MODULES</span></div>
    <div className="academy-hero"><div><p className="academy-kicker">KNOW THE TACTICS. BREAK THE TRAP.</p><h1 id="academy-title">THE INTERNET<br/>IS A <em>TRAP.</em><br/><span>OUTSMART IT.</span></h1><p className="academy-description">Learn to recognize deception before it costs you. Practice with scenarios, investigate links, test your knowledge, and ask your AI coach.</p></div><div className="academy-rank"><span>OPERATIVE STATUS</span><strong>LVL {String(level).padStart(2,'0')}</strong><p>{xp} XP EARNED</p><div className="academy-meter"><i style={{width:`${levelProgress/3}%`}}/></div><small>{300-levelProgress} XP TO NEXT LEVEL</small><small>{completed.length} / {questions.length} CHALLENGES MASTERED</small></div></div>
    {!mode?<><div className="academy-section-label"><span>SELECT YOUR TRAINING MODULE</span><span>04 AVAILABLE / 03 CHALLENGE TRACKS</span></div><div className="academy-grid">{(Object.keys(modeInfo) as Mode[]).map(key=><button key={key} className="academy-module" onClick={()=>openMode(key)}><span className="academy-module-top">MODULE / {modeInfo[key].num}<b>{modeInfo[key].icon}</b></span><strong>{modeInfo[key].title}</strong><span className="academy-module-desc">{modeInfo[key].description}</span><span className="academy-module-bottom">{key==='coach'?'ASK THE COACH':`${questions.filter(q=>q.category===key&&completed.includes(q.id)).length} / ${questions.filter(q=>q.category===key).length} COMPLETE`}<b>↗</b></span></button>)}</div><p className="academy-footnote">PROGRESS IS SAVED IN THIS BROWSER. EACH CHALLENGE AWARDS 100 XP ON ITS FIRST CORRECT ANSWER.</p></>:
    <div className="academy-workspace"><button className="academy-back" onClick={()=>setMode(null)}>← BACK TO MODULES</button><div className="academy-workspace-head"><span>MODULE / {modeInfo[mode].num}</span><h2>{modeInfo[mode].title}</h2><p>{modeInfo[mode].description}</p></div>{mode==='coach'?<div className="academy-chat"><div className="academy-chat-history" role="log" aria-live="polite">{messages.map((m,i)=><div key={i} className={`academy-bubble ${m.role}`}><small>{m.role==='user'?'YOU':'SCAMSHIELD COACH'}</small><div className="academy-markdown">
  {m.role === 'assistant' ? (
    <ReactMarkdown>{m.text}</ReactMarkdown>
  ) : (
    <p>{m.text}</p>
  )}
</div></div>)}{busy&&<div className="academy-bubble assistant"><small>SCAMSHIELD COACH</small><p>Thinking through your question…</p></div>}</div>{chatError&&<p className="academy-error" role="alert">{chatError}</p>}<form className="academy-chat-form" onSubmit={sendMessage}><label htmlFor="academy-chat-input">ASK A CYBER SAFETY QUESTION</label><div><input id="academy-chat-input" value={draft} maxLength={1500} onChange={e=>setDraft(e.target.value)} placeholder="How do I recognize a phishing email?" disabled={busy}/><button type="submit" disabled={busy||!draft.trim()}>SEND ↗</button></div></form><p className="academy-footnote">EDUCATIONAL GUIDANCE ONLY. DO NOT SHARE PASSWORDS, OTPs, OR PRIVATE DATA.</p></div>:question&&<div className="academy-question"><div className="academy-question-meta"><span>CASE FILE / {String(index+1).padStart(2,'0')} OF {String(activeQuestions.length).padStart(2,'0')}</span><span>+100 XP / FIRST CORRECT ANSWER</span></div><h3>{question.title}</h3><div className="academy-scenario">{question.content}</div><p className="academy-instruction">CHOOSE THE BEST RESPONSE</p><div className="academy-options">{question.options.map((option,i)=><button key={i} disabled={answer!==null} className={`academy-option ${answer!==null&&i===question.correct?'is-correct':''} ${answer===i&&i!==question.correct?'is-wrong':''}`} onClick={()=>submitAnswer(i)}><span>{String.fromCharCode(65+i)}.</span>{option}</button>)}</div>{answer!==null&&<div className="academy-feedback" role="status"><strong>{answer===question.correct?'✓ CORRECT ASSESSMENT':'✕ NOT QUITE — HERE IS WHY'}</strong><p>{question.explanation}</p><p><b>DEFENSE TIP:</b> {question.tip}</p><button onClick={nextQuestion}>NEXT CASE FILE →</button></div>}</div>}</div>}
  </section>;
}
