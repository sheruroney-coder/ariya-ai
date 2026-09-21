import React, {useEffect, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const welcome = {
  role: "assistant",
  content: "नमस्ते, मैं ARIYA हूँ 💕\nआपकी अपनी स्मार्ट AI साथी। मैं आपकी मदद करने के लिए तैयार हूँ।"
};

function App() {
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ariya_messages")) || [welcome]; }
    catch { return [welcome]; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("ariya_dark") === "1");
  const recognitionRef = useRef(null);

  useEffect(() => localStorage.setItem("ariya_messages", JSON.stringify(messages)), [messages]);
  useEffect(() => {
    localStorage.setItem("ariya_dark", dark ? "1" : "0");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  async function send(text = input) {
    const value = text.trim();
    if (!value || loading) return;
    const userMsg = {role:"user", content:value};
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({messages:[...messages, userMsg]})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI request failed");
      setMessages(m => [...m, {role:"assistant", content:data.reply || "मुझे जवाब नहीं मिला।"}]);
    } catch (e) {
      setMessages(m => [...m, {role:"assistant", content:"AI अभी connect नहीं है। API setup होने के बाद मैं जवाब देना शुरू कर दूँगी।"}]);
    } finally { setLoading(false); }
  }

  function voice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("इस browser में voice input उपलब्ध नहीं है।");
    const r = new SR();
    r.lang = "hi-IN";
    r.interimResults = false;
    r.onresult = e => setInput(e.results[0][0].transcript);
    r.start();
    recognitionRef.current = r;
  }

  function speak(text) {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "hi-IN";
      speechSynthesis.speak(u);
    }
  }

  function clearChat() {
    setMessages([welcome]);
    localStorage.removeItem("ariya_messages");
  }

  return <div className="app">
    <header className="topbar">
      <div className="brand">
        <div className="avatar">A</div>
        <div><b>ARIYA AI</b><small>आपकी अपनी स्मार्ट AI साथी</small></div>
      </div>
      <div className="actions">
        <button onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
        <button onClick={clearChat}>🗑️</button>
      </div>
    </header>

    <main className="chat">
      <div className="intro">
        <div className="big-avatar">A</div>
        <h1>नमस्ते, मैं ARIYA हूँ 💕</h1>
        <p>आप क्या करना चाहते हैं? मुझसे कुछ भी पूछ सकते हैं।</p>
        <div className="suggestions">
          {["मुझे पढ़ाई में मदद करो", "मेरे लिए एक resume बनाओ", "एक business idea बताओ"].map(x =>
            <button key={x} onClick={() => send(x)}>{x}</button>
          )}
        </div>
      </div>
      <section className="messages">
        {messages.map((m,i) => <div key={i} className={"row "+m.role}>
          <div className="bubble">
            <div className="content">{m.content}</div>
            {m.role === "assistant" && <button className="speak" onClick={() => speak(m.content)}>🔊</button>}
          </div>
        </div>)}
        {loading && <div className="row assistant"><div className="bubble typing">ARIYA सोच रही है…</div></div>}
      </section>
    </main>

    <footer className="composer">
      <button className="round" onClick={voice}>🎙️</button>
      <input value={input} onChange={e=>setInput(e.target.value)}
        onKeyDown={e=>e.key==="Enter" && send()} placeholder="ARIYA से कुछ पूछें..." />
      <button className="send" onClick={()=>send()}>➤</button>
    </footer>
  </div>;
}

createRoot(document.getElementById("root")).render(<App />);
