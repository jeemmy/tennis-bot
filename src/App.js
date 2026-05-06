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
  const cards = [
    { icon:"🤖", title:"المساعد", desc:"تحدث مع AI Tennis", tab:"chat" },
    { icon:"❓", title:"اختبار", desc:"اختبر معرفتك", tab:"quiz" },
    { icon:"📖", title:"القاموس", desc:"مصطلحات التنس", tab:"dict" },
    { icon:"📊", title:"الإحصائيات", desc:"تتبع.progress", tab:"stats" },
  ];
  return (
    <div className="home-section">
      <div className="home-logo-box">
        <div className="home-logo">
          <img src={Logo} alt="Tennis Bot" />
        </div>
      </div>
      
      <h1 className="home-title">تنس بوت 🎾</h1>
      <p className="home-sub">مساعدك الذكي للتنس<br/>اسأل · تعلم · انطلق</p>
      
      <button className="home-cta" onClick={()=>setTab("chat")}>
        🚀 ابدأ الآن
      </button>
      
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
  const [voiceMode, setVoiceMode] = useState(false); // وضع المحادثة الصوتية الحية
  const recognitionRef = useRef(null);
  const sendTimeoutRef = useRef(null);
  const lastSentRef = useRef(""); //追踪 آخر نص تم إرساله لمنع التكرار
  const endRef = useRef(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  // بدء التعرف على الصوت
  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('المتصفح لا يدعم التعرف على الصوت');
      return;
    }

    // إيقاف أي جلسة سابقة
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false; // استخدام غير مستمر لتجنب التكرار
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";
    
    recognition.onresult = (event) => {
      // الحصول على أحدث نتيجة فقط
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim();
      
      setInput(transcript);

      // إذا كانresult نهائي وليس فارغ
      if (result.isFinal && transcript.length > 0) {
        // التأكد من أن النص مختلف عن آخر رسالة مرسلة
        if (transcript !== lastSentRef.current && transcript.length >= 2) {
          finalTranscript = transcript;
          
          // إرسال تلقائي بعد التوقف بـ 1 ثانية
          sendTimeoutRef.current = setTimeout(() => {
            handleVoiceSend(finalTranscript);
          }, 1000);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      // إعادة المحاولة تلقائياً في حالة الخطأ
      if (event.error !== 'aborted' && voiceMode) {
        setTimeout(() => {
          if (voiceMode && !isRecording) startVoiceRecognition();
        }, 1000);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      // إعادة التشغيل تلقائياً إذا كنا في وضع المحادثة الصوتية
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
    lastSentRef.current = ""; // إعادة تعيين لمنع التكرار
    setInput("");
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
        // إذا كانت هناك محاولة إعادة محاولات متبقية
        if (retryCount < maxRetries) {
          console.log(`Retry ${retryCount + 1}/${maxRetries}...`);
          setTimeout(() => sendWithRetry(text, retryCount + 1, maxRetries), 1000);
          return;
        }
        // إخفاء رسالة الخطأ من المستخدم
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

  // إرسال الصوت للمادثة ( يستخدم sendWithRetry )
  const handleVoiceSend = async (text) => {
    await sendWithRetry(text, 0, 3);
  };

  // تحويل النص للحديث (Text-to-Speech)
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    // إيقاف أي صوت正在进行
    window.speechSynthesis.cancel();
    
    const clean = (text || '').replace(/<[^>]+>/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    const hasArabic = /[\u0600-\u06FF]/.test(clean);
    utter.lang = hasArabic ? 'ar-SA' : 'en-US';
    utter.rate = 1;
    utter.pitch = 1;
    
    // تشغيل الصوت
    window.speechSynthesis.speak(utter);
  };
  
  // إيقاف النطق عند إيقاف المحادثة الصوتية
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };
  
  // تفعيل/إلغاء وضع المحادثة الصوتية الحية
  const toggleVoiceMode = () => {
    if (voiceMode) {
      // إلغاء وضع المحادثة الصوتية
      stopVoiceCompletely();
      stopSpeaking(); // إيقاف أي صوت正在进行
      setVoiceMode(false);
    } else {
      // تفعيل وضع المحادثة الصوتية
      setVoiceMode(true);
      startVoiceRecognition();
    }
  };

  // إرسال نص عادي (مع إعادة المحاولة)
  const send = async text => {
    await sendWithRetry(text || input, 0, 3);
  };

  const fmt = t => t.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>");

  return (
    <div className="chat-wrap">
      <div className="chat-hdr">
        <span className="chat-hdr-av">🎾</span>
        <div>
          <div className="chat-hdr-title">المساعد الذكي</div>
          <div className="chat-hdr-sub">{voiceMode ? "🎤 محادثة صوتية حية" : "متخصص في التنس فقط"}</div>
        </div>
        <span className={`online-dot ${voiceMode ? 'recording' : ''}`}/>
      </div>

      <div className={`chat-body ${voiceMode ? 'with-voice-controls' : ''}`}>
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
          <div className="suggest-lbl">💡 جرّب:</div>
          <div className="suggest-row">
            {SUGGESTIONS.map((s,i)=><button key={i} className="sug-btn" onClick={()=>send(s)}>{s}</button>)}
          </div>
        </div>
      )}

      <div className="input-bar">
        <button 
          className={`voice-mode-btn ${voiceMode ? 'active' : ''}`}
          onClick={toggleVoiceMode}
        >
          {voiceMode ? "⏹️ إيقاف المحادثة الصوتية" : "🎤 محادثة صوتية"}
        </button>
        
        {voiceMode && (
          <div className="voice-indicator">
            {isRecording ? "🎤 جاري الاستماع... (تحدث الآن)" : "⏳ بانتظار发言ك..."}
          </div>
        )}
        
        <div className="input-row">
          <input 
            className="ta" 
            value={input} 
            disabled={loading}
            placeholder={voiceMode ? "تحدث الآن..." : "اسألني عن التنس..."}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
          />
          
          {!voiceMode && (
            <button 
              className={`mic-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopVoiceRecognition : startVoiceRecognition}
            >
              {isRecording ? "⏹️" : "🎤"}
            </button>
          )}
          
          <button className="send-btn" disabled={loading||!input.trim()} onClick={()=>send()}>➤</button>
        </div>
      </div>
      <div className="input-hint">
        {voiceMode ? "تحدث وانتظر الإجابة الآلية - اضغط 'إيقاف' للخروج" : "Enter للإرسال · Shift+Enter سطر جديد"}
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
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Tajawal', sans-serif; background: #060d1a; color: #fff; }
button { font-family: 'Tajawal', sans-serif; cursor: pointer; transition: all .2s; }
button:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
button:disabled { cursor: not-allowed; opacity: 0.5; }
textarea, input { font-family: 'Tajawal', sans-serif; }
textarea:focus, input:focus { outline: none; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 3px; }

.root { display: flex; direction: rtl; min-height: 100vh; background: radial-gradient(ellipse at top right, #0a1f0a 0%, #060d1a 60%); }
.sidebar { width: 220px; flex-shrink: 0; background: rgba(255,255,255,.03); border-left: 1px solid rgba(255,255,255,.07); display: flex; flex-direction: column; padding: 24px 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
.side-brand { text-align: center; padding: 0 16px 20px; border-bottom: 1px solid rgba(255,255,255,.07); margin-bottom: 12px; }
.side-ball { font-size: 40px; display: block; margin-bottom: 6px; }
.side-name { color: #fff; font-size: 17px; font-weight: 900; }
.side-sub { color: rgba(255,255,255,.35); font-size: 11px; }
.side-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 0 10px; }
.nav-btn { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: 12px; border: 1px solid transparent; background: transparent; color: rgba(255,255,255,.45); font-size: 14px; width: 100%; text-align: right; }
.nav-btn.active { background: rgba(22,163,74,.15); color: #4ade80; border-color: rgba(22,163,74,.3); }
.side-foot { padding: 16px; text-align: center; color: rgba(255,255,255,.2); font-size: 10px; border-top: 1px solid rgba(255,255,255,.07); }

.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.page-wrap { flex: 1; overflow-y: auto; padding: 20px; }
.bottom-nav { display: none; padding: 10px; gap: 8px; background: rgba(0,0,0,.3); border-top: 1px solid rgba(255,255,255,.05); }
@media (max-width: 768px) { .sidebar { display: none; } .bottom-nav { display: flex; } .page-wrap { padding: 12px 16px 80px; } }

.section { padding: 28px 24px 100px; }
.sec-title { color: #fff; font-size: 22px; font-weight: 900; margin-bottom: 4px; }
.sec-sub { color: rgba(255,255,255,.4); font-size: 13px; margin-bottom: 20px; }

.hero { text-align: center; padding: 32px 16px 28px; }
.hero-ball { font-size: 64px; display: block; margin-bottom: 12px; }
.hero-title { color: #fff; font-size: 28px; font-weight: 900; margin-bottom: 10px; }
.hero-sub { color: rgba(255,255,255,.5); font-size: 14px; line-height: 1.8; margin-bottom: 20px; }
.hero-btn { background: linear-gradient(135deg,#16a34a,#15803d); color: #fff; border: none; border-radius: 50px; padding: 13px 30px; font-size: 15px; font-weight: 700; box-shadow: 0 6px 20px rgba(22,163,74,.4); }

.cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
.feat-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 18px; text-align: right; display: flex; flex-direction: column; gap: 6px; transition: all .2s; }
.feat-card:hover { border-color: var(--col,#16a34a); background: rgba(255,255,255,.05); }
.feat-icon { font-size: 32px; margin-bottom: 4px; }
.feat-title { color: #fff; font-size: 15px; font-weight: 700; }
.feat-desc { color: rgba(255,255,255,.5); font-size: 12px; line-height: 1.4; flex: 1; }
.feat-arrow { color: var(--col,#16a34a); font-size: 11px; font-weight: 600; margin-top: 4px; }

.about-box { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.05); border-radius: 14px; padding: 20px; margin-top: 20px; }
.about-title { color: #fff; font-size: 16px; font-weight: 700; margin-bottom: 10px; }
.about-text { color: rgba(255,255,255,.6); font-size: 13px; line-height: 1.6; margin-bottom: 12px; }
.tech-row { display: flex; gap: 8px; flex-wrap: wrap; }
.tech-tag { background: rgba(22,163,74,.2); color: #4ade80; border: 1px solid rgba(22,163,74,.3); border-radius: 20px; padding: 5px 12px; font-size: 12px; font-weight: 600; }

.chat-wrap { height: 100%; display: flex; flex-direction: column; max-width: 800px; margin: 0 auto; background: rgba(0,0,0,0.2); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
.chat-hdr { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 12px; }
.chat-hdr-av { font-size: 24px; }
.chat-hdr-title { font-weight: 700; }
.chat-hdr-sub { font-size: 12px; color: rgba(255,255,255,.4); }
.online-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; margin-left: auto; }
.chat-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
.msg-row { display: flex; gap: 10px; align-items: flex-start; max-width: 85%; }
.msg-row.user { align-self: flex-end; flex-direction: row-reverse; max-width: 100%; }
.msg-row.assistant { align-self: flex-start; }
.av { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.av.bot { background: rgba(74,222,128,.1); }
.av.user { background: rgba(22,163,74,.2); }
.bubble { padding: 12px 16px; border-radius: 18px; line-height: 1.5; font-size: 14px; word-wrap: break-word; }
.bubble.assistant { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,.9); }
.bubble.user { background: #16a34a; color: #fff; }
.typing-bub { display: flex; gap: 4px; align-items: center; }
.d { width: 6px; height: 6px; background: rgba(255,255,255,.4); border-radius: 50%; animation: typing 1.4s infinite; }
.d:nth-child(2) { animation-delay: .2s; }
.d:nth-child(3) { animation-delay: .4s; }
@keyframes typing { 0%, 60%, 100% { opacity: .5; } 30% { opacity: 1; } }

.suggest-wrap { padding: 15px 20px; background: rgba(255,255,255,0.01); border-top: 1px solid rgba(255,255,255,0.05); }
.suggest-lbl { font-size: 12px; color: rgba(255,255,255,.4); margin-bottom: 8px; }
.suggest-row { display: flex; gap: 8px; flex-wrap: wrap; }
.sug-btn { background: rgba(255,255,255,0.05); color: rgba(255,255,255,.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 6px 12px; font-size: 12px; }
.sug-btn:hover { background: rgba(255,255,255,0.1); }

.input-bar { padding: 15px; display: flex; gap: 10px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.05); }
.ta { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px; color: #fff; resize: none; font-size: 14px; }
.ta::placeholder { color: rgba(255,255,255,.3); }
.send-btn { background: #16a34a; color: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-weight: 700; }
.send-btn:disabled { background: rgba(22,163,74,.3); }
.input-hint { padding: 8px 15px; text-align: center; font-size: 11px; color: rgba(255,255,255,.2); }

.quiz-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 0 4px; }
.quiz-prog { font-size: 13px; color: rgba(255,255,255,.5); }
.quiz-pts { font-size: 13px; color: #4ade80; font-weight: 600; }
.prog-bar { width: 100%; height: 6px; background: rgba(255,255,255,.05); border-radius: 3px; overflow: hidden; }
.prog-fill { height: 100%; background: linear-gradient(90deg,#16a34a,#4ade80); border-radius: 3px; transition: width .3s; }

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
.restart-btn { background: #16a34a; color: #fff; border: none; border-radius: 12px; padding: 12px 28px; font-size: 15px; font-weight: 700; margin-top: 20px; }

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
.bottom-btn.active { color: #4ade80; }
.bottom-icon { font-size: 20px; }
.bottom-label { font-size: 10px; }

@media (max-width: 640px) {
  .cards-grid { grid-template-columns: 1fr; }
  .dict-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr; }
  .info-grid { grid-template-columns: 1fr; }
  .q-text { font-size: 16px; }
  .hero-title { font-size: 24px; }
  .hero-ball { font-size: 48px; }
}
`;