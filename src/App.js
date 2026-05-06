import { useState, useRef, useEffect } from "react";
import './App.css';
import Logo from './logo.png';

/* ═══════════════════════════ DATA ═══════════════════════════ */

const SYSTEM_PROMPT = `أنت مساعد ذكي متخصص حصريًا في رياضة التنس. اسمك "تنس بوت".
قواعدك الصارمة:
1. تجيب فقط على الأسئلة المتعلقة بالتنس: القواعد، اللاعبين، البطولات، التقنيات، المعدات، التاريخ، الاستراتيجيات، التدريب.
2. إذا سألك أحد عن أي موضوع آخر غير التنس، ترفض بلطف وتذكّره أنك متخصص في التنس فقط.
3. تجيب باللغة التي يكتب بها المستخدم (عربي أو إنجليزي).
4. تكون إجاباتك دقيقة، مفيدة، ومنظمة مع استخدام الرموز التعبيرية أحياناً.
5. عند الرفض، اقترح سؤالاً عن التنس قد يهم المستخدم.`;

const QUIZ_QUESTIONS = [
  { q: "كم عدد الأشواط في مباراة التنس للرجال في الغراند سلام؟", options: ["3 أشواط", "5 أشواط", "4 أشواط", "2 شوط"], answer: 1 },
  { q: "ما هو أول بطولة كبرى في العام؟", options: ["ويمبلدون", "رولان غاروس", "أستراليا المفتوحة", "US Open"], answer: 2 },
  { q: "ما اسم الضربة التي تبدأ بها النقطة؟", options: ["فوليه", "سيرف", "سماش", "لوب"], answer: 1 },
  { q: "على أي نوع ملعب تُقام بطولة ويمبلدون؟", options: ["كلاي", "هارد", "عشب", "سجاد"], answer: 2 },
  { q: "من اللاعب الأكثر فوزاً بالغراند سلام للرجال؟", options: ["فيدرر", "نادال", "ديوكوفيتش", "سامبراس"], answer: 2 },
  { q: "ماذا يعني التعادل عند 40-40؟", options: ["نهاية الشوط", "ديوس", "تايبريك", "فوز المرسِل"], answer: 1 },
  { q: "ما معنى مصطلح Ace في التنس؟", options: ["خطأ في الإرسال", "سيرف مباشر لا يُلمس", "ضربة لوب", "فوليه قوية"], answer: 1 },
  { q: "كم يبلغ طول ملعب التنس القياسي؟", options: ["23.77 م", "26 م", "20 م", "28 م"], answer: 0 },
  { q: "ما ترتيب نقاط التنس من الأدنى للأعلى؟", options: ["0-15-30-40", "0-10-20-30", "1-2-3-4", "0-15-25-35"], answer: 0 },
  { q: "على أي نوع ملعب تُقام رولان غاروس؟", options: ["عشب", "هارد", "كلاي (تراب)", "داخلي"], answer: 2 },
];

const DICTIONARY = [
  { term: "Ace",        ar: "آس",          def: "إرسال لا يلمسه المستقبل، يُسجَّل نقطة مباشرة." },
  { term: "Deuce",      ar: "ديوس",        def: "تعادل 40-40، يجب الفوز بنقطتين متتاليتين." },
  { term: "Fault",      ar: "خطأ",         def: "إرسال خارج المنطقة الصحيحة، للاعب محاولة ثانية." },
  { term: "Volley",     ar: "فوليه",       def: "ضرب الكرة قبل ارتدادها، عادةً قرب الشبكة." },
  { term: "Lob",        ar: "لوب",         def: "ضربة مرتفعة فوق رأس الخصم لدفعه للخلف." },
  { term: "Smash",      ar: "سماش",        def: "ضربة قوية من الأعلى لإنهاء النقطة." },
  { term: "Backhand",   ar: "باك هاند",    def: "ضربة بالجانب الخلفي للمضرب، بيد أو بيدين." },
  { term: "Forehand",   ar: "فورهاند",     def: "الضربة الرئيسية بنفس جانب يد المضرب." },
  { term: "Break Point",ar: "نقطة كسر",   def: "نقطة تمنح المستقبل فرصة كسر خدمة الخصم." },
  { term: "Grand Slam", ar: "غراند سلام",  def: "أهم 4 بطولات: أستراليا، رولان غاروس، ويمبلدون، US Open." },
  { term: "Tiebreak",   ar: "تايبريك",     def: "شوط فاصل عند تعادل اللاعبين 6-6." },
  { term: "Drop Shot",  ar: "دروب شوت",    def: "ضربة قصيرة قرب الشبكة لإرباك الخصم البعيد." },
  { term: "Rally",      ar: "رالي",        def: "تبادل متواصل للكرة بين اللاعبين." },
  { term: "Seed",       ar: "تصنيف",       def: "ترتيب اللاعبين في البطولة بناءً على مستواهم." },
  { term: "Love",       ar: "صفر",         def: "مصطلح يعني الصفر في نظام التسجيل التنسي." },
];

const SUGGESTIONS = [
  "ما هي قواعد التنس الأساسية؟",
  "من هو أفضل لاعب في التاريخ؟",
  "ما الفرق بين أنواع الملاعب؟",
  "كيف أحسّن ضربة السيرف؟",
  "ما هي بطولات الغراند سلام؟",
];

const NAV = [
  { id: "home",  icon: "🏠", label: "الرئيسية" },
  { id: "chat",  icon: "🤖", label: "المساعد" },
  { id: "quiz",  icon: "❓", label: "اختبار" },
  { id: "dict",  icon: "📖", label: "القاموس" },
  { id: "stats", icon: "📊", label: "إحصائيات" },
];

/* ═══════════════════════════ ROOT ═══════════════════════════ */
export default function App() {
  const [tab, setTab]   = useState("home");
  
  // Load stats from localStorage on mount
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('tennisStats');
    return saved ? JSON.parse(saved) : { questions: 0, quizDone: 0, quizScore: 0 };
  });
  
  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tennisStats', JSON.stringify(stats));
  }, [stats]);
  
  const addQ  = ()      => setStats(s => ({ ...s, questions: s.questions + 1 }));
  const addQz = score   => setStats(s => ({ ...s, quizDone: s.quizDone + 1, quizScore: Math.max(s.quizScore, score) }));

  return (
    <div className="root">
      <aside className="sidebar">
        <div className="side-brand">
          <span className="side-ball">🎾</span>
          <div className="side-name">تنس بوت</div>
          <div className="side-sub">مشروع التخرج</div>
        </div>
        <nav className="side-nav">
          {NAV.map(n => (
            <button key={n.id} className={`nav-btn ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="side-foot">Tennis AI · v1.0 · 2026</div>
      </aside>

      <main className="main">
        <div className="page-wrap">
          {tab==="home"  && <Home  setTab={setTab}/>}
          {tab==="chat"  && <Chat  addQuestion={addQ}/>}
          {tab==="quiz"  && <Quiz  addQuiz={addQz}/>}
          {tab==="dict"  && <Dict/>}
          {tab==="stats" && <Stats stats={stats}/>}
        </div>

        <nav className="bottom-nav">
          {NAV.map(n => (
            <button key={n.id} className={`bottom-btn ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
              <span className="bottom-icon">{n.icon}</span>
              <span className="bottom-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </main>

      <style>{STYLES}</style>
    </div>
  );
}

/* ═══════════════════════════ HOME ═══════════════════════════ */
function Home({ setTab }) {
  const features = [
    { icon:"🤖", title:"AI الذكي", desc:"تحدث مع البوت" },
    { icon:"🎯", title:"نصائح احترافية", desc:"تحسّن مستواك" },
    { icon:"📊", title:"الإحصائيات", desc:"تتبع تقدمك" },
    { icon:"📖", title:"القاموس", desc:"تعلم المصطلحات" },
  ];
  
  const cards = [
    { icon:"🤖", title:"المساعد", desc:"تحدث مع AI Tennis", tab:"chat" },
    { icon:"❓", title:"اختبار", desc:"اختبر معرفتك", tab:"quiz" },
    { icon:"📖", title:"القاموس", desc:"مصطلحات التنس", tab:"dict" },
    { icon:"📊", title:"الإحصائيات", desc:"تتبع progress", tab:"stats" },
  ];
  
  return (
    <div className="home-section">
      <div className="home-logo-box">
        <div className="home-logo">
          <img src={Logo} alt="Tennis Bot" />
        </div>
      </div>
      
      <h1 className="home-title">تنس <span>بوت</span> 🎾</h1>
      <p className="home-sub">مساعدك الذكي المتخصص في التنس - اسأل، تعلم، وتفوق</p>
      
      <button className="home-cta" onClick={()=>setTab("chat")}>
        🚀 ابدأ المحادثة الآن
      </button>
      
      <div className="home-features">
        {features.map((f, i) => (
          <div key={i} className="home-feature">
            <div className="home-feature-icon">{f.icon}</div>
            <div className="home-feature-title">{f.title}</div>
            <div className="home-feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
      
      <div className="home-cards">
        {cards.map(c => (
          <button key={c.tab} className="home-card" onClick={()=>setTab(c.tab)}>
            <span className="home-card-icon">{c.icon}</span>
            <span className="home-card-title">{c.title}</span>
            <span className="home-card-desc">{c.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ CHAT (MODIFIED FOR OPENROUTER) ═══════════════════════════ */
function Chat({ addQuestion }) {
  const [msgs, setMsgs] = useState([
    { role:"assistant", content:"مرحبًا! أنا **تنس بوت** 🎾\nمساعدك الذكي المتخصص في كل ما يخص التنس.\nاسألني عن القواعد، اللاعبين، البطولات، التقنيات وأكثر!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const recognitionRef = useRef(null);
  const sendTimeoutRef = useRef(null);
  const lastSentRef = useRef("");
  const endRef = useRef(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  // بدء التعرف على الصوت
  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('المتصفح لا يدعم التعرف على الصوت');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";
    
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim();
      
      setInput(transcript);

      if (result.isFinal && transcript.length > 0) {
        if (transcript !== lastSentRef.current && transcript.length >= 2) {
          finalTranscript = transcript;
          sendTimeoutRef.current = setTimeout(() => {
            handleVoiceSend(finalTranscript);
          }, 1000);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'aborted' && voiceMode) {
        setTimeout(() => {
          if (voiceMode && !isRecording) startVoiceRecognition();
        }, 1000);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (voiceMode) {
        setTimeout(() => {
          if (voiceMode && !isRecording) startVoiceRecognition();
        }, 500);
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  // إيقاف التعرف على الصوت
  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
      recognitionRef.current = null;
    }
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
    }
    setIsRecording(false);
  };

  // إيقاف كامل للمحادثة الصوتية
  const stopVoiceCompletely = () => {
    stopVoiceRecognition();
    lastSentRef.current = "";
    setInput("");
  };

  // تحويل النص للحديث (Text-to-Speech)
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const clean = (text || '').replace(/<[^>]+>/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    const hasArabic = /[\u0600-\u06FF]/.test(clean);
    utter.lang = hasArabic ? 'ar-SA' : 'en-US';
    utter.rate = 1;
    utter.pitch = 1;
    
    window.speechSynthesis.speak(utter);
  };
  
  // إيقاف النطق
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // تفعيل/إلغاء وضع المحادثة الصوتية
  const toggleVoiceMode = () => {
    if (voiceMode) {
      stopVoiceCompletely();
      stopSpeaking();
      setVoiceMode(false);
    } else {
      setVoiceMode(true);
      startVoiceRecognition();
    }
  };

  // دالة إرسال مع إعادة المحاولة التلقائية
  const sendWithRetry = async (text, retryCount = 0, maxRetries = 3) => {
    const t = text.trim();
    if (!t || loading) return;
    
    lastSentRef.current = t;
    setInput("");
    const next = [...msgs, { role: "user", content: t }];
    setMsgs(next); setLoading(true); addQuestion();

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000"
        },
        body: JSON.stringify({
          model: "google/gemma-4-31b-it:free", 
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...next.map(m => ({ role: m.role, content: m.content }))
          ]
        })
      });

      const d = await res.json();
      
      if (!res.ok) {
        if (retryCount < maxRetries) {
          console.log(`Retry ${retryCount + 1}/${maxRetries}...`);
          setTimeout(() => sendWithRetry(text, retryCount + 1, maxRetries), 1000);
          return;
        }
        setMsgs([...next, { role: "assistant", content: "🔄 جاري إعادة المحاولة..." }]);
      } else {
        const reply = d.choices?.[0]?.message?.content || "حدث خطأ في استلام الرد.";
        setMsgs([...next, { role: "assistant", content: reply }]);
        
        if (voiceMode) {
          setTimeout(() => speakText(reply), 500);
        }
      }

    } catch (error) {
      if (retryCount < maxRetries) {
        console.log(`Retry ${retryCount + 1}/${maxRetries} due to error...`);
        setTimeout(() => sendWithRetry(text, retryCount + 1, maxRetries), 1500);
        return;
      }
      setMsgs([...next, { role: "assistant", content: "🔄 حدث خطأ. حاول مجدداً." }]);
    } finally { 
      setLoading(false); 
    }
  };

  // إرسال الصوت للمادثة
  const handleVoiceSend = async (text) => {
    await sendWithRetry(text, 0, 3);
  };

  // إرسال نص عادي (مع إعادة المحاولة)
  const send = async text => {
    await sendWithRetry(text || input, 0, 3);
  };

  const fmt = t => t.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>");

  return (
    <div className="chat-wrap">
      <div className="chat-hdr">
        <div className="chat-hdr-left">
          <div className="chat-hdr-av">🎾</div>
          <div className="chat-hdr-info">
            <div className="chat-hdr-title">تنس بوت - المساعد الذكي</div>
            <div className="chat-hdr-sub">{voiceMode ? "🎤 محادثة صوتية حية" : "متخصص في التنس فقط"}</div>
          </div>
        </div>
        <span className="online-dot"/>
      </div>

      <div className={`chat-body ${voiceMode ? 'with-voice' : ''}`}>
        {msgs.map((m,i)=>(
          <div key={i} className={`msg-row ${m.role}`}>
            {m.role==="assistant"&&<span className="av bot">🎾</span>}
            <div className={`bubble ${m.role}`} dangerouslySetInnerHTML={{__html:fmt(m.content)}}/>
            {m.role==="assistant"&&(
              <button className="tts-btn" aria-label="تشغيل صوتي" onClick={()=>speakText(m.content)}>🔊</button>
            )}
            {m.role==="user"&&<span className="av user">👤</span>}
          </div>
        ))}
        {loading&&(
          <div className="msg-row assistant">
            <span className="av bot">🎾</span>
            <div className="bubble assistant typing-bub"><span className="d"/><span className="d"/><span className="d"/></div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {msgs.length<=1&&(
        <div className="suggest-wrap">
          <div className="suggest-lbl">💡 اقتراحات:</div>
          <div className="suggest-row">
            {SUGGESTIONS.map((s,i)=><button key={i} className="sug-btn" onClick={()=>send(s)}>{s}</button>)}
          </div>
        </div>
      )}

      <div className="input-bar">
        <button 
          className={`voice-toggle ${voiceMode ? 'active' : ''}`}
          onClick={toggleVoiceMode}
        >
          {voiceMode ? "⏹️ إيقاف المحادثة الصوتية" : "🎤 محادثة صوتية"}
        </button>
        
        <div className="input-row">
          <textarea 
            className="ta" 
            value={input} 
            disabled={loading}
            placeholder={voiceMode ? "جاري الاستماع..." : "اسألني عن التنس..."}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
          />
          <button className="send-btn" disabled={loading||!input.trim()} onClick={()=>send()}>
            {loading ? "⏳" : "➤"}
          </button>
        </div>
      </div>
      <div className="input-hint">
        {voiceMode ? "تحدث وانتظر الإجابة الآلية" : "Enter للإرسال · Shift+Enter للسطر الجديد"}
      </div>
    </div>
  );
}

/* ═══════════════════════════ QUIZ ═══════════════════════════ */
function Quiz({ addQuiz }) {
  const [idx,setIdx]       = useState(0);
  const [sel,setSel]       = useState(null);
  const [score,setScore]   = useState(0);
  const [done,setDone]     = useState(false);
  const [log,setLog]       = useState([]);

  const pick = i => {
    if(sel!==null) return;
    setSel(i);
    const ok = i===QUIZ_QUESTIONS[idx].answer;
    const ns = ok?score+1:score;
    const nl = [...log,{ok,correct:QUIZ_QUESTIONS[idx].answer,chosen:i,q:QUIZ_QUESTIONS[idx].q}];
    setTimeout(()=>{
      if(idx+1>=QUIZ_QUESTIONS.length){ setDone(true); addQuiz(Math.round(ns/QUIZ_QUESTIONS.length*100)); setScore(ns); setLog(nl); }
      else { setIdx(idx+1); setSel(null); setScore(ns); setLog(nl); }
    },900);
  };

  const restart=()=>{ setIdx(0);setSel(null);setScore(0);setDone(false);setLog([]); };
  const pct = Math.round(score/QUIZ_QUESTIONS.length*100);

  if(done) return(
    <div className="section">
      <div className="done-box">
        <div className="done-emoji">{pct>=80?"🏆":pct>=60?"🎾":"📚"}</div>
        <h2 className="done-title">انتهى الاختبار!</h2>
        <div className="done-score">{score}/{QUIZ_QUESTIONS.length}</div>
        <div className="done-pct">{pct}%</div>
        <div className="done-msg">{pct>=80?"ممتاز! أنت خبير تنس 🏆":pct>=60?"جيد جداً! استمر 💪":"راجع القاموس وحاول مجدداً 📖"}</div>
        <div className="prog-bar"><div className="prog-fill" style={{width:pct+"%"}}/></div>
        <div className="review">
          <h3 className="review-title">مراجعة الإجابات:</h3>
          {log.map((a,i)=>(
            <div key={i} className={`review-item ${a.ok?"ok":"fail"}`}>
              <div className="review-q">{i+1}. {a.q}</div>
              <div className="review-ans">{a.ok?"✅ صحيح":`❌ الصحيح: ${QUIZ_QUESTIONS[i].options[a.correct]}`}</div>
            </div>
          ))}
        </div>
        <button className="restart-btn" onClick={restart}>🔄 إعادة الاختبار</button>
      </div>
    </div>
  );

  const q = QUIZ_QUESTIONS[idx];
  return(
    <div className="section">
      <div className="quiz-meta">
        <span className="quiz-prog">السؤال {idx+1} من {QUIZ_QUESTIONS.length}</span>
        <span className="quiz-pts">النقاط: {score}</span>
      </div>
      <div className="prog-bar" style={{marginBottom:20}}>
        <div className="prog-fill" style={{width:(idx/QUIZ_QUESTIONS.length*100)+"%"}}/>
      </div>
      <div className="q-box">
        <div className="q-num">❓ السؤال {idx+1}</div>
        <div className="q-text">{q.q}</div>
        <div className="opts-grid">
          {q.options.map((opt,i)=>{
            let cls="opt-btn";
            if(sel!==null){ if(i===q.answer) cls+=" correct"; else if(i===sel) cls+=" wrong"; }
            return(
              <button key={i} className={cls} onClick={()=>pick(i)}>
                <span className="opt-letter">{["أ","ب","ج","د"][i]}</span>{opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ DICT ═══════════════════════════ */
function Dict() {
  const [q,setQ]=useState("");
  const list = DICTIONARY.filter(d=>
    d.term.toLowerCase().includes(q.toLowerCase())||d.ar.includes(q)||d.def.includes(q)
  );
  return(
    <div className="section">
      <h2 className="sec-title">📖 قاموس مصطلحات التنس</h2>
      <p className="sec-sub">{DICTIONARY.length} مصطلح مع شرح عربي وإنجليزي</p>
      <input className="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 ابحث عن مصطلح..."/>
      <div className="dict-grid">
        {list.map((d,i)=>(
          <div key={i} className="dict-card">
            <div className="dict-top"><span className="dict-en">{d.term}</span><span className="dict-ar">{d.ar}</span></div>
            <p className="dict-def">{d.def}</p>
          </div>
        ))}
        {!list.length&&<div className="no-res">لا توجد نتائج 🔍</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════ STATS ═══════════════════════════ */
function Stats({ stats }) {
  const cards=[
    {icon:"💬",label:"الأسئلة المطروحة",  value:stats.questions,   col:"#16a34a"},
    {icon:"📝",label:"مرات الاختبار",      value:stats.quizDone,    col:"#ca8a04"},
    {icon:"🏆",label:"أعلى نتيجة",         value:stats.quizScore+"%",col:"#7c3aed"},
    {icon:"📖",label:"مصطلحات القاموس",    value:DICTIONARY.length, col:"#0284c7"},
    {icon:"❓",label:"أسئلة الاختبار",     value:QUIZ_QUESTIONS.length,col:"#dc2626"},
    {icon:"🎾",label:"مجال التخصص",        value:"التنس فقط",       col:"#059669"},
  ];
  return(
    <div className="section">
      <h2 className="sec-title">📊 الإحصائيات</h2>
      <p className="sec-sub">تتبّع نشاطك داخل التطبيق</p>
      <div className="stats-grid">
        {cards.map((c,i)=>(
          <div key={i} className="stat-card" style={{"--col":c.col}}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-val">{c.value}</div>
            <div className="stat-lbl">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="info-box">
        <h3 className="info-title">ℹ️ عن التطبيق</h3>
        <div className="info-grid">
          {[["🤖 النموذج","Gemini 2.0 Flash (OpenRouter)"],["🌐 التقنية","React.js + API"],
            ["🎯 الهدف","مساعد متخصص بالتنس فقط"],["🌍 اللغات","العربية والإنجليزية"],
            ["📅 السنة","2026"],["🎓 النوع","مشروع تخرج"]].map(([k,v])=>(
            <div key={k} className="info-row"><span className="info-k">{k}</span><span className="info-v">{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ CSS ═══════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900;1000&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Cairo', 'Outfit', sans-serif; background: linear-gradient(135deg, #0a0f14 0%, #0f1419 50%, #0d1117 100%); color: #fff; }
button { font-family: 'Cairo', 'Outfit', sans-serif; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
button:hover:not(:disabled) { opacity: .9; }
button:disabled { cursor: not-allowed; opacity: 0.5; }
textarea, input { font-family: 'Cairo', 'Outfit', sans-serif; }
textarea:focus, input:focus { outline: none; }
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(79,172,254,0.2); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(79,172,254,0.3); }

.root { display: flex; direction: rtl; min-height: 100vh; background: #0a0f14; }
.sidebar { width: 260px; flex-shrink: 0; background: linear-gradient(180deg, rgba(79,172,254,0.05) 0%, rgba(79,172,254,0.02) 100%); border-left: 1px solid rgba(79,172,254,0.1); display: flex; flex-direction: column; padding: 28px 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
.side-brand { text-align: center; padding: 0 20px 24px; border-bottom: 1px solid rgba(79,172,254,0.1); margin-bottom: 16px; }
.side-ball { font-size: 48px; display: block; margin-bottom: 8px; }
.side-name { color: #fff; font-size: 18px; font-weight: 900; background: linear-gradient(135deg, #0ea5e9 0%, #4ade80 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.side-sub { color: rgba(255,255,255,.4); font-size: 12px; }
.side-nav { flex: 1; display: flex; flex-direction: column; gap: 6px; padding: 0 12px; }
.nav-btn { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: 14px; border: 1px solid transparent; background: transparent; color: rgba(255,255,255,.5); font-size: 15px; width: 100%; text-align: right; transition: all 0.3s; }
.nav-btn:hover { background: rgba(79,172,254,0.1); color: rgba(255,255,255,.7); }
.nav-btn.active { background: linear-gradient(135deg, rgba(79,172,254,0.2) 0%, rgba(79,172,254,0.1) 100%); color: #0ea5e9; border-color: rgba(79,172,254,0.3); }
.side-foot { padding: 16px; text-align: center; color: rgba(255,255,255,.25); font-size: 11px; border-top: 1px solid rgba(79,172,254,0.1); }

.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: linear-gradient(to bottom, #0a0f14, #0d1117); }
.page-wrap { flex: 1; overflow-y: auto; padding: 20px; }
.bottom-nav { display: none; padding: 12px 8px; gap: 8px; background: rgba(10,15,20,0.8); backdrop-filter: blur(20px); border-top: 1px solid rgba(79,172,254,0.1); }
@media (max-width: 768px) { .sidebar { display: none; } .bottom-nav { display: flex; } .page-wrap { padding: 12px 16px 80px; } }

/* ═════════════════ HOME PAGE ═════════════════ */
.home-section { text-align: center; padding: 80px 24px 100px; position: relative; overflow: hidden; background: linear-gradient(180deg, rgba(79,172,254,0.12) 0%, transparent 50%, rgba(79,172,254,0.05) 100%); }
@media (min-width: 1024px) { .home-section { padding: 120px 24px 160px; } }
.home-section::before { content: ''; position: absolute; top: -30%; left: 50%; transform: translateX(-50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(79,172,254,0.2) 0%, rgba(79,172,254,0.08) 35%, transparent 70%); filter: blur(80px); animation: pulse-float 6s ease-in-out infinite; }
@keyframes pulse-float { 0%,100% { transform: translateX(-50%) translateY(0) scale(1); } 50% { transform: translateX(-50%) translateY(-20px) scale(1.05); } }

.home-logo-box { position: relative; z-index: 2; margin-bottom: 60px; perspective: 1000px; }
.home-logo { width: 200px; height: 200px; margin: 0 auto; background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%); border: 4px solid #fff; border-radius: 50px; display: flex; align-items: center; justify-content: center; box-shadow: 0 50px 100px rgba(0,0,0,0.4), 0 0 0 25px rgba(79,172,254,0.2), inset 0 3px 10px rgba(255,255,255,0.9); animation: hover-lift 5s ease-in-out infinite; position: relative; overflow: hidden; }
@media (min-width: 768px) {
  .home-logo { width: 320px; height: 320px; border-radius: 70px; }
}
@media (min-width: 1024px) {
  .home-logo { width: 500px; height: 500px; border-radius: 100px; }
}
@media (min-width: 1440px) {
  .home-logo { width: 600px; height: 600px; border-radius: 120px; }
}
@keyframes hover-lift { 0%,100% { transform: translateY(0) rotateZ(0deg); } 50% { transform: translateY(-15px) rotateZ(3deg); } }
.home-logo::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(79,172,254,0.1) 0%, transparent 100%); }
.home-logo img { width: 75%; height: 75%; object-fit: contain; filter: drop-shadow(0 8px 16px rgba(79,172,254,0.4)); position: relative; z-index: 1; }

.home-title { color: #fff; font-size: 36px; font-weight: 900; margin-bottom: 16px; position: relative; z-index: 2; letter-spacing: -1.5px; line-height: 1.2; text-shadow: 0 4px 20px rgba(0,0,0,0.4); font-family: 'Cairo', sans-serif; }
@media (min-width: 768px) { .home-title { font-size: 48px; } }
@media (min-width: 1024px) { .home-title { font-size: 72px; } }
@media (min-width: 1440px) { .home-title { font-size: 84px; } }
.home-title span { background: linear-gradient(135deg, #4ade80 0%, #0ea5e9 50%, #4ade80 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: gradient-shift 8s ease infinite; }

.home-sub { color: rgba(255,255,255,0.75); font-size: 22px; margin-bottom: 48px; position: relative; z-index: 2; line-height: 1.9; font-weight: 500; max-width: 600px; margin-left: auto; margin-right: auto; letter-spacing: 0.5px; font-family: 'Cairo', sans-serif; }

.home-cta { background: linear-gradient(135deg, #0ea5e9 0%, #0288d1 40%, #4ade80 100%); color: #fff; border: none; border-radius: 32px; padding: 22px 60px; font-size: 20px; font-weight: 700; box-shadow: 0 25px 60px rgba(79,172,254,0.45), 0 0 0 0 rgba(79,172,254,0.6); position: relative; z-index: 2; display: inline-block; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); overflow: hidden; cursor: pointer; }
.home-cta::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); transform: translateX(-100%); transition: transform 0.7s; }
.home-cta::after { content: ''; position: absolute; inset: 0; border-radius: 32px; background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent); }
.home-cta:hover { transform: translateY(-8px) scale(1.08); box-shadow: 0 35px 80px rgba(79,172,254,0.55), 0 0 0 12px rgba(79,172,254,0.25); letter-spacing: 1px; }
.home-cta:hover::before { transform: translateX(100%); }
.home-cta:active { transform: translateY(-3px) scale(1.04); }

.home-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 18px; margin-top: 80px; position: relative; z-index: 2; }
.home-feature { background: linear-gradient(145deg, rgba(79,172,254,0.1) 0%, rgba(79,172,254,0.02) 100%); border: 1px solid rgba(79,172,254,0.15); border-radius: 22px; padding: 28px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); position: relative; overflow: hidden; }
.home-feature::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(79,172,254,0.15) 0%, transparent 100%); opacity: 0; transition: opacity 0.4s; }
.home-feature:hover { border-color: rgba(79,172,254,0.35); transform: translateY(-10px) scale(1.04); box-shadow: 0 24px 48px rgba(79,172,254,0.2); }
.home-feature:hover::before { opacity: 1; }
.home-feature-icon { font-size: 48px; filter: drop-shadow(0 6px 12px rgba(79,172,254,0.3)); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.home-feature:hover .home-feature-icon { transform: scale(1.2) rotateZ(10deg); }
.home-feature-title { color: #fff; font-size: 16px; font-weight: 700; }
.home-feature-desc { color: rgba(255,255,255,0.55); font-size: 12px; line-height: 1.5; text-align: center; }

.home-cards { display: grid; grid-template-columns: repeat(2,1fr); gap: 18px; margin-top: 60px; position: relative; z-index: 2; }
@media (max-width: 768px) { .home-cards { grid-template-columns: 1fr; } }
.home-card { background: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%); border: 1.5px solid rgba(79,172,254,0.2); border-radius: 24px; padding: 28px 18px; display: flex; flex-direction: column; align-items: center; gap: 12px; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); position: relative; overflow: hidden; cursor: pointer; }
.home-card::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 100%; height: 100%; background: radial-gradient(circle at 50% 0%, rgba(79,172,254,0.2) 0%, transparent 60%); opacity: 0; transition: opacity 0.4s; }
.home-card:hover { border-color: rgba(79,172,254,0.4); transform: translateY(-8px) scale(1.03); box-shadow: 0 24px 50px rgba(79,172,254,0.25); }
.home-card:hover::before { opacity: 1; }
.home-card-icon { font-size: 40px; filter: drop-shadow(0 4px 8px rgba(79,172,254,0.2)); transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.home-card:hover .home-card-icon { transform: scale(1.25) rotate(8deg) translateY(-5px); }
.home-card-title { color: #fff; font-size: 17px; font-weight: 700; }
.home-card-desc { color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 500; }

/* ═════════════════ CHAT PAGE ═════════════════ */
.chat-wrap { height: 100%; display: flex; flex-direction: column; max-width: 900px; margin: 0 auto; width: 100%; background: linear-gradient(145deg, rgba(79,172,254,0.08) 0%, rgba(79,172,254,0.02) 100%); border-radius: 28px; border: 1px solid rgba(79,172,254,0.15); box-shadow: 0 20px 60px rgba(0,0,0,0.3); backdrop-filter: blur(20px); overflow: hidden; }
.chat-hdr { padding: 20px 24px; border-bottom: 1px solid rgba(79,172,254,0.1); display: flex; align-items: center; justify-content: space-between; gap: 12px; background: linear-gradient(90deg, rgba(79,172,254,0.1) 0%, transparent 100%); }
.chat-hdr-left { display: flex; align-items: center; gap: 14px; }
.chat-hdr-av { font-size: 32px; }
.chat-hdr-info { display: flex; flex-direction: column; gap: 2px; }
.chat-hdr-title { font-size: 16px; font-weight: 700; color: #fff; }
.chat-hdr-sub { font-size: 12px; color: rgba(255,255,255,.5); }
.online-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; margin-left: auto; animation: pulse-dot 2s infinite; }
@keyframes pulse-dot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.2); } }
.chat-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.msg-row { display: flex; gap: 12px; align-items: flex-start; max-width: 85%; animation: slide-in 0.3s ease-out; }
@keyframes slide-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.msg-row.user { align-self: flex-end; flex-direction: row-reverse; max-width: 100%; }
.msg-row.assistant { align-self: flex-start; }
.av { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.av.bot { background: linear-gradient(135deg, #0ea5e9, #4ade80); box-shadow: 0 4px 12px rgba(79,172,254,0.3); }
.av.user { background: linear-gradient(135deg, #4ade80, #0ea5e9); box-shadow: 0 4px 12px rgba(79,172,254,0.2); }
.bubble { padding: 14px 18px; border-radius: 18px; line-height: 1.6; font-size: 15px; word-wrap: break-word; font-weight: 400; }
.bubble.assistant { background: rgba(79,172,254,0.12); border: 1px solid rgba(79,172,254,0.2); color: rgba(255,255,255,.95); }
.bubble.user { background: linear-gradient(135deg, #0ea5e9 0%, #0288d1 100%); color: #fff; box-shadow: 0 4px 12px rgba(79,172,254,0.3); }
.typing-bub { display: flex; gap: 5px; align-items: center; padding: 12px 16px; }
.d { width: 8px; height: 8px; background: rgba(255,255,255,.5); border-radius: 50%; animation: typing 1.4s infinite; }
.d:nth-child(2) { animation-delay: .2s; }
.d:nth-child(3) { animation-delay: .4s; }
@keyframes typing { 0%, 60%, 100% { opacity: .3; } 30% { opacity: 1; } }

.suggest-wrap { padding: 18px 24px; background: transparent; border-top: 1px solid rgba(79,172,254,0.1); }
.suggest-lbl { font-size: 12px; color: rgba(255,255,255,.4); margin-bottom: 10px; font-weight: 600; }
.suggest-row { display: flex; gap: 8px; flex-wrap: wrap; }
.sug-btn { background: rgba(79,172,254,0.08); color: rgba(255,255,255,.8); border: 1px solid rgba(79,172,254,0.2); border-radius: 18px; padding: 8px 14px; font-size: 13px; transition: all 0.3s; }
.sug-btn:hover { background: rgba(79,172,254,0.15); border-color: rgba(79,172,254,0.4); transform: translateY(-2px); }

.input-bar { padding: 18px 24px; display: flex; gap: 10px; background: rgba(79,172,254,0.05); border-top: 1px solid rgba(79,172,254,0.1); }
.ta { flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(79,172,254,0.2); border-radius: 14px; padding: 12px 14px; color: #fff; resize: none; font-size: 15px; transition: all 0.3s; max-height: 100px; }
.ta::placeholder { color: rgba(255,255,255,.35); }
.ta:focus { background: rgba(255,255,255,0.08); border-color: rgba(79,172,254,0.4); }
.send-btn { background: linear-gradient(135deg, #0ea5e9, #4ade80); color: #fff; border: none; border-radius: 12px; padding: 10px 16px; font-weight: 700; transition: all 0.3s; box-shadow: 0 4px 12px rgba(79,172,254,0.3); }
.send-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79,172,254,0.4); }
.send-btn:disabled { background: rgba(79,172,254,0.2); color: rgba(255,255,255,.4); }
.input-hint { padding: 8px 15px; text-align: center; font-size: 11px; color: rgba(255,255,255,.2); }

.voice-toggle { width: 100%; padding: 12px; background: rgba(79,172,254,0.08); border: 1px solid rgba(79,172,254,0.2); border-radius: 12px; color: rgba(255,255,255,.8); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s; margin-bottom: 10px; }
.voice-toggle:hover { background: rgba(79,172,254,0.15); border-color: rgba(79,172,254,0.4); }
.voice-toggle.active { background: linear-gradient(135deg, #ef4444, #dc2626); border-color: transparent; color: #fff; }

.tts-btn { background: rgba(79,172,254,0.1); border: 1px solid rgba(79,172,254,0.2); border-radius: 8px; padding: 6px 10px; font-size: 14px; cursor: pointer; transition: all 0.2s; margin-right: 8px; }
.tts-btn:hover { background: rgba(79,172,254,0.2); transform: scale(1.1); }

/* ═════════════════ RESPONSIVE ═════════════════ */
@media (max-width: 640px) {
  .home-section { padding: 80px 16px 100px; }
  .home-logo { width: 140px; height: 140px; }
  .home-title { font-size: 36px; }
  .home-sub { font-size: 16px; }
  .home-features { grid-template-columns: 1fr; margin-top: 60px; }
  .home-cards { grid-template-columns: 1fr; }
  .msg-row, .msg-row.user { max-width: 95%; }
  .chat-wrap { border-radius: 16px; }
}

.section { padding: 28px 24px 100px; }
.sec-title { color: #fff; font-size: 22px; font-weight: 900; margin-bottom: 4px; }
.sec-sub { color: rgba(255,255,255,.4); font-size: 13px; margin-bottom: 20px; }
.about-box { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.05); border-radius: 14px; padding: 20px; margin-top: 20px; }
.about-title { color: #fff; font-size: 16px; font-weight: 700; margin-bottom: 10px; }
.about-text { color: rgba(255,255,255,.6); font-size: 13px; line-height: 1.6; margin-bottom: 12px; }
.tech-row { display: flex; gap: 8px; flex-wrap: wrap; }
.tech-tag { background: rgba(79,172,254,.15); color: #0ea5e9; border: 1px solid rgba(79,172,254,.3); border-radius: 20px; padding: 5px 12px; font-size: 12px; font-weight: 600; }

.quiz-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 0 4px; }
.quiz-prog { font-size: 13px; color: rgba(255,255,255,.5); }
.quiz-pts { font-size: 13px; color: #4ade80; font-weight: 600; }
.prog-bar { width: 100%; height: 6px; background: rgba(255,255,255,.05); border-radius: 3px; overflow: hidden; }
.prog-fill { height: 100%; background: linear-gradient(90deg,#0ea5e9,#4ade80); border-radius: 3px; transition: width .3s; }

.q-box { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 28px; margin-bottom: 20px; }
.q-num { font-size: 13px; color: rgba(255,255,255,.4); margin-bottom: 8px; }
.q-text { font-size: 18px; color: #fff; font-weight: 600; margin-bottom: 24px; line-height: 1.6; }
.opts-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
.opt-btn { background: rgba(255,255,255,.03); border: 2px solid rgba(255,255,255,.1); border-radius: 12px; padding: 14px 16px; text-align: right; color: rgba(255,255,255,.8); font-size: 15px; transition: all .2s; display: flex; align-items: center; gap: 12px; }
.opt-btn:hover:not(.wrong):not(.correct) { border-color: rgba(255,255,255,.2); background: rgba(255,255,255,.05); }
.opt-btn.correct { background: rgba(34,197,94,.15); border-color: #22c55e; color: #4ade80; }
.opt-btn.wrong { background: rgba(239,68,68,.15); border-color: #ef4444; color: #fca5a5; }
.opt-letter { width: 28px; height: 28px; background: rgba(255,255,255,.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }

.done-box { text-align: center; padding: 40px 20px; }
.done-emoji { font-size: 80px; margin-bottom: 20px; }
.done-title { font-size: 28px; font-weight: 900; margin-bottom: 20px; }
.done-score { font-size: 48px; color: #4ade80; font-weight: 900; }
.done-pct { font-size: 36px; color: #4ade80; margin-bottom: 12px; }
.done-msg { color: rgba(255,255,255,.7); font-size: 16px; margin-bottom: 20px; }
.review { text-align: right; margin-top: 30px; }
.review-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #fff; }
.review-item { background: rgba(255,255,255,.02); border-left: 3px solid rgba(255,255,255,.1); border-radius: 8px; padding: 12px; margin-bottom: 10px; text-align: right; }
.review-item.ok { border-left-color: #4ade80; }
.review-item.fail { border-left-color: #ef4444; }
.review-q { font-size: 14px; color: #fff; margin-bottom: 6px; }
.review-ans { font-size: 13px; color: rgba(255,255,255,.6); }
.restart-btn { background: #0ea5e9; color: #000; border: none; border-radius: 12px; padding: 12px 28px; font-size: 15px; font-weight: 700; margin-top: 20px; }

.search { width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: 12px 16px; color: #fff; font-size: 14px; margin-bottom: 20px; }
.search::placeholder { color: rgba(255,255,255,.3); }
.dict-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.dict-card { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 16px; text-align: right; }
.dict-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.dict-en { color: #4ade80; font-size: 14px; font-weight: 700; }
.dict-ar { color: #fff; font-size: 14px; font-weight: 700; }
.dict-def { color: rgba(255,255,255,.6); font-size: 13px; line-height: 1.5; }
.no-res { text-align: center; padding: 40px; color: rgba(255,255,255,.3); font-size: 16px; grid-column: 1 / -1; }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
.stat-card { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 20px; text-align: center; border-top: 3px solid var(--col,#4ade80); }
.stat-icon { font-size: 32px; margin-bottom: 8px; }
.stat-val { font-size: 28px; font-weight: 900; color: var(--col,#4ade80); margin-bottom: 4px; }
.stat-lbl { font-size: 12px; color: rgba(255,255,255,.5); }
.info-box { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 20px; margin-top: 20px; }
.info-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-row { display: flex; justify-content: space-between; gap: 8px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.05); }
.info-k { color: rgba(255,255,255,.5); font-size: 13px; }
.info-v { color: #fff; font-size: 13px; font-weight: 600; }

.bottom-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px; color: rgba(255,255,255,.4); font-size: 11px; border: none; background: transparent; }
.bottom-btn.active { color: #0ea5e9; }
.bottom-icon { font-size: 20px; }
.bottom-label { font-size: 10px; }
`;