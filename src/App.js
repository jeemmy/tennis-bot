import { useState, useRef, useEffect } from "react";
import './App.css';
import Logo from './logo.png';
import { Home as HomeIcon, MessageSquare, ClipboardCheck, BookOpen, BarChart3, Play, Send, Mic, MicOff, Volume2, ArrowRight, MessageCircle, FileText, Trophy, BookMarked, HelpCircle, Focus } from 'lucide-react';
import { CircleDot } from 'lucide-react';

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
  "ما الفرق بين أنواع الملاعب؟",
  "كيف أحسّن ضربة السيرف؟",
];

const NAV = [
  { id: "home", icon: HomeIcon, label: "الرئيسية" },
  { id: "chat", icon: MessageSquare, label: "المدرب" },
  { id: "quiz", icon: ClipboardCheck, label: "اختبار" },
  { id: "dict", icon: BookOpen, label: "القاموس" },
  { id: "stats", icon: BarChart3, label: "إحصائيات" },
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
        <div className="side-logo">
          <div className="side-logo-icon"><CircleDot size={26} color="#4ade80" /></div>
          <div className="side-logo-text">تنس بوت</div>
        </div>
        <nav className="side-nav">
          {NAV.map(n => {
            const Icon = n.icon;
            return (
              <button key={n.id} className={`nav-btn ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
                <Icon size={20} /><span>{n.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="side-footer">Tennis Bot · v1.0 · 2026</div>
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
          {NAV.map(n => {
            const Icon = n.icon;
            return (
              <button key={n.id} className={`bottom-btn ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
                <Icon size={22} />
                <span className="bottom-label">{n.label}</span>
              </button>
            );
          })}
        </nav>
      </main>

      <style>{STYLES}</style>
    </div>
  );
}

/* ═══════════════════════════ HOME ═══════════════════════════ */
function Home({ setTab }) {
  const quickLinks = [
    { icon: MessageSquare, label: "المدرب الذكي", desc: "اسأل عن الخطط، التمارين، والتحضير للمباريات.", tab: "chat" },
    { icon: ClipboardCheck, label: "الاختبارات", desc: "اختبر القواعد، التكتيك، وذكاءك داخل الملعب.", tab: "quiz" },
    { icon: BookOpen, label: "المفردات", desc: "تعلم مصطلحات التنس بأمثلة واضحة.", tab: "dict" },
    { icon: BarChart3, label: "الإحصائيات", desc: "تابع تطورك عبر جلسات التدريب.", tab: "stats" },
  ];

  return (
    <div className="home-section">
      <div className="hero-bg">
        <div className="hero-overlay" />
        <div className="hero-gradient" />
        <div className="hero-glow-main" />
        <div className="hero-orbit">
          <div className="hero-orbit-dot" />
        </div>
        <div className="hero-glow" />
      </div>

      <div className="hero-content">
        <div className="home-logo">
          <img src={Logo} alt="تنس بوت" />
        </div>

        <h1 className="hero-title">
         <span>تنـس بــوت!</span>
        </h1>

        <p className="hero-subtitle">
          تنس بوت هو مساعد مدعوم بالذكاء الاصطناعي يجمع بين المدرب، الاختبارات، مفردات التنس، وأي شئ آخر يخص التنس في مكان واحد. ابدأ بالدردشة الان!.
        </p>

        <div className="hero-btns">
          <button className="hero-cta" onClick={() => setTab("chat")}>
            <Play size={18} fill="currentColor" /> ابدأ مع المدرب
          </button>
          <button className="hero-cta-sec" onClick={() => setTab("stats")}>
            عرض الإحصائيات
          </button>
        </div>

        <div className="quick-links">
          {quickLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <button key={item.tab} className="quick-link" onClick={() => setTab(item.tab)}>
                <div className="quick-link-icon-row">
                  <Icon size={20} className="quick-link-icon" />
                  <ArrowRight size={16} className="quick-link-arrow" />
                </div>
                <div>
                  <h3 className="quick-link-title">{item.label}</h3>
                  <p className="quick-link-desc">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
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
          <div className="chat-hdr-av"><CircleDot size={22} color="#4ade80" /></div>
          <div className="chat-hdr-info">
            <div className="chat-hdr-title">تنس بوت - المساعد الذكي</div>
            <div className="chat-hdr-sub">{voiceMode ? <><Mic size={12} /> محادثة صوتية حية</> : "متخصص في التنس فقط"}</div>
          </div>
        </div>
        <span className="online-dot"/>
      </div>

      <div className={`chat-body ${voiceMode ? 'with-voice' : ''}`}>
        {msgs.map((m,i)=>(
          <div key={i} className={`msg-row ${m.role}`}>
            <div className={`bubble ${m.role}`} dangerouslySetInnerHTML={{__html:fmt(m.content)}}/>
            {m.role==="assistant"&&(
              <button className="tts-btn" aria-label="تشغيل صوتي" onClick={()=>speakText(m.content)}><Volume2 size={14} /></button>
            )}
          </div>
        ))}
        {loading&&(
          <div className="msg-row assistant">
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
          {voiceMode ? <><MicOff size={14} /> إيقاف المحادثة الصوتية</> : <><Mic size={14} /> محادثة صوتية</>}
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
            {loading ? <span className="animate-pulse">...</span> : <Send size={16} />}
          </button>
        </div>
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
    <div className="section dict-section">
      <div className="dict-header">
        <h2 className="sec-title">قاموس مصطلحات التنس</h2>
        <p className="sec-sub">{DICTIONARY.length} مصطلح مع شرح عربي وإنجليزي</p>
      </div>
      <div className="dict-search-wrap">
        <input className="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="ابحث عن مصطلح..."/>
      </div>
      <div className="dict-grid">
        {list.map((d,i)=>(
          <div key={i} className="dict-card">
            <div className="dict-top"><span className="dict-en">{d.term}</span><span className="dict-ar">{d.ar}</span></div>
            <p className="dict-def">{d.def}</p>
          </div>
        ))}
        {!list.length&&<div className="no-res">لا توجد نتائج</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════ STATS ═══════════════════════════ */
function Stats({ stats }) {
  const cards=[
    {icon:MessageCircle,label:"الأسئلة المطروحة",  value:stats.questions,   col:"#16a34a"},
    {icon:FileText,label:"مرات الاختبار",      value:stats.quizDone,    col:"#ca8a04"},
    {icon:Trophy,label:"أعلى نتيجة",         value:stats.quizScore+"%",col:"#7c3aed"},
    {icon:BookMarked,label:"مصطلحات القاموس",    value:DICTIONARY.length, col:"#0284c7"},
    {icon:HelpCircle,label:"أسئلة الاختبار",     value:QUIZ_QUESTIONS.length,col:"#dc2626"},
    {icon:Focus,label:"مجال التخصص",        value:"التنس فقط",       col:"#059669"},
  ];
  return(
    <div className="section stats-section">
      <div className="stats-header">
        <h2 className="sec-title">الإحصائيات</h2>
        <p className="sec-sub">تتبّع نشاطك داخل التطبيق</p>
      </div>
<div className="stats-grid">
        {cards.map((c,i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="stat-card" style={{"--col":c.col}}>
              <div className="stat-icon"><Icon size={24} color={c.col} /></div>
              <div className="stat-val">{c.value}</div>
              <div className="stat-lbl">{c.label}</div>
            </div>
          );
        })}
      </div>
      <div className="info-box">
        <h3 className="info-title">عن التطبيق</h3>
        <div className="info-grid">
          {[["النموذج","Gemini 2.0 Flash (OpenRouter)"],["التقنية","React.js + API"],
            ["الهدف","مساعد متخصص بالتنس فقط"],["اللغات","العربية والإنجليزية"],
            ["السنة","2026"],["النوع","مشروع تخرج"]].map(([k,v])=>(
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
:root {
  --tennis-green: #dcfc2d;
  --tennis-green-dark: #c5e628;
  --bg-dark: #02040a;
  --bg-slate: #020617;
  --border-white: rgba(255,255,255,0.1);
  --text-slate: #94a3b8;
  --text-light: #f8fafc;
}

body { font-family: 'Cairo', 'Outfit', sans-serif; background-color: var(--bg-dark); color: var(--text-light); }
button { font-family: 'Cairo', 'Outfit', sans-serif; cursor: pointer; transition: all 0.3s; }
button:hover:not(:disabled) { opacity: .9; }
button:disabled { cursor: not-allowed; opacity: 0.5; }
textarea, input { font-family: 'Cairo', 'Outfit', sans-serif; }
textarea:focus, input:focus { outline: none; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

::selection { background: rgba(220,252,45,0.32); color: var(--text-light); }

.root { display: flex; direction: rtl; min-height: 100vh; background: var(--bg-dark); position: relative; overflow: hidden; }

/* Background Effects */
.root::before {
  content: '';
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(circle at 76% 12%, rgba(220,252,45,0.16), transparent 28%),
    radial-gradient(circle at 12% 20%, rgba(79,70,229,0.20), transparent 28%),
    linear-gradient(180deg, rgba(2,6,23,0) 0%, var(--bg-dark) 76%);
  pointer-events: none;
  z-index: 0;
}

/* Court Lines Background */
.root::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: 
    linear-gradient(rgba(220,252,45,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(220,252,45,0.05) 1px, transparent 1px);
  background-size: 72px 72px;
  opacity: 0.35;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, black, transparent 80%);
  z-index: 0;
}

/* Sidebar */
.sidebar { 
  width: 260px; 
  flex-shrink: 0; 
  background: transparent; 
  border-left: 1px solid var(--border-white); 
  display: flex; 
  flex-direction: column; 
  padding: 24px 0; 
  position: sticky; 
  top: 0; 
  height: 100vh; 
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 50;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(2,4,10,0.3) 0%, rgba(2,6,23,0.5) 100%);
  pointer-events: none;
}

.side-logo { 
  display: flex; 
  align-items: center; 
  justify-content: center;
  gap: 12px; 
  padding: 0 20px 24px; 
  border-bottom: 1px solid var(--border-white); 
  margin-bottom: 20px; 
  position: relative;
}

.side-logo-icon {
  width: 48px; 
  height: 48px; 
  background: #ffffff; 
  border-radius: 14px; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.side-logo-text { 
  font-size: 22px; 
  font-weight: 900; 
  color: var(--text-light); 
  text-align: center;
}

.side-nav { flex: 1; display: flex; flex-direction: column; gap: 6px; padding: 0 12px; }
.nav-btn { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  padding: 14px 16px; 
  border-radius: 14px; 
  border: none; 
  background: transparent; 
  color: var(--text-slate); 
  font-size: 15px; 
  font-weight: 600; 
  width: 100%; 
  text-align: right;
  transition: all 0.2s;
}
.nav-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-light); }
.nav-btn.active { 
  background: var(--tennis-green); 
  color: #020617; 
  font-weight: 700;
  box-shadow: 0 0 25px rgba(220,252,45,0.35);
}
.nav-icon { font-size: 20px; }

.side-footer { 
  padding: 16px; 
  text-align: center; 
  color: rgba(255,255,255,0.25); 
  font-size: 11px; 
  border-top: 1px solid var(--border-white); 
}

.side-logo { 
  display: flex; 
  align-items: center; 
  justify-content: center;
  gap: 12px; 
  padding: 0 20px 24px; 
  border-bottom: 1px solid var(--border-white); 
  margin-bottom: 20px; 
}

.side-logo-icon {
  width: 48px; 
  height: 48px; 
  background: #ffffff; 
  border-radius: 14px; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  font-size: 26px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.side-logo-text { 
  font-size: 22px; 
  font-weight: 900; 
  color: var(--text-light); 
  text-align: center;
}

.side-nav { flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 0 12px; }
.nav-btn { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  padding: 14px 16px; 
  border-radius: 14px; 
  border: none; 
  background: transparent; 
  color: var(--text-slate); 
  font-size: 15px; 
  font-weight: 600; 
  width: 100%; 
  text-align: right;
  transition: all 0.2s;
}
.nav-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-light); }
.nav-btn.active { 
  background: var(--tennis-green); 
  color: #020617; 
  font-weight: 700;
  box-shadow: 0 0 25px rgba(220,252,45,0.35);
}
.nav-icon { font-size: 20px; }

.side-stats { 
  margin: 16px 12px; 
  padding: 16px; 
  background: rgba(255,255,255,0.03); 
  border: 1px solid var(--border-white); 
  border-radius: 16px; 
}
.side-stats-label { font-size: 11px; color: var(--text-slate); margin-bottom: 6px; }
.side-stats-value { font-size: 14px; font-weight: 700; color: var(--tennis-green); }
.side-stats-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 8px; overflow: hidden; }
.side-stats-fill { height: 100%; background: var(--tennis-green); border-radius: 3px; width: 75%; }

.side-footer { padding: 16px; text-align: center; color: rgba(255,255,255,0.25); font-size: 11px; border-top: 1px solid var(--border-white); }

/* Main Content */
.main { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden; 
  position: relative;
  z-index: 10;
}

.page-wrap { 
  flex: 1; 
  overflow-y: auto; 
  overflow-x: hidden;
  padding: 24px; 
  max-width: 1400px; 
  margin: 0 auto; 
  width: 100%;
}

@media (max-width: 1024px) {
  .sidebar { display: none; } 
  .bottom-nav { 
    display: flex; 
    padding: 8px 4px; 
    gap: 2px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg-slate);
    border-top: 1px solid var(--border-white);
    z-index: 100;
    height: 65px;
  } 
  .page-wrap { 
    padding: 16px 16px 75px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .page-wrap::-webkit-scrollbar { display: none; }
}

@media (max-width: 1024px) {
  .chat-wrap { 
    flex: 1;
    display: flex;
    flex-direction: column;
    height: auto;
    min-height: 0;
    overflow: hidden;
  }
  .chat-body { 
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
}

/* Section with scroll for mobile */
.section { 
  padding: 24px; 
}
@media (max-width: 1024px) {
  .section { 
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

/* Bottom Nav Buttons */
.bottom-btn { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 4px; 
  padding: 8px; 
  color: var(--text-slate); 
  font-size: 10px; 
  border: none; 
  background: transparent; 
  border-radius: 12px;
  transition: all 0.2s;
}
.bottom-btn.active { color: var(--tennis-green); background: rgba(220,252,45,0.1); }
.bottom-icon { font-size: 22px; }
.bottom-label { font-size: 10px; font-weight: 600; }

/* ===================== HOME PAGE ===================== */
.home-section { 
  position: relative;
  padding: 0;
  min-height: calc(100vh - 48px);
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--bg-dark) 0%, rgba(2,4,10,0.88) 34%, rgba(2,4,10,0.36) 72%, rgba(2,4,10,0.82) 100%);
}

.hero-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(to top, var(--bg-dark), transparent);
}

/* Glow effect */
.hero-glow-main {
  position: absolute;
  right: -30px;
  bottom: 30px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(40px);
  display: block;
}
@media (min-width: 768px) { .hero-glow-main { width: 300px; height: 300px; right: 0; } }

/* Animated Orbit */
.hero-orbit {
  position: absolute;
  left: -100px;
  top: 60px;
  width: 320px;
  height: 320px;
  border: 1px solid rgba(220,252,45,0.2);
  border-radius: 50%;
  animation: orbit-rotate 20s linear infinite;
  display: block;
}
@keyframes orbit-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.hero-orbit-dot {
  position: absolute;
  left: 50%;
  top: -8px;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  background: var(--tennis-green);
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(220,252,45,0.8);
}

.hero-glow {
  position: absolute;
  bottom: 100px;
  left: 32px;
  width: 128px;
  height: 128px;
  background: rgba(220,252,45,0.15);
  border-radius: 50%;
  filter: blur(40px);
  animation: pulse-glow 4.5s ease-in-out infinite;
  display: none;
}
@media (min-width: 768px) { .hero-glow { display: block; } }
@keyframes pulse-glow { 0%,100% { transform: scale(1); opacity: 0.45; } 50% { transform: scale(1.35); opacity: 0.8; } }

.hero-content {
  position: relative;
  z-index: 10;
  padding: 40px 16px;
  max-width: 900px;
}

.home-logo {
  width: 140px;
  height: 140px;
  margin-bottom: 20px;
  background: #ffffff;
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 50px rgba(255,255,255,0.2),
    0 10px 25px rgba(0,0,0,0.3);
  animation: float 4s ease-in-out infinite;
}
@media (max-width: 380px) {
  .home-logo { width: 110px; height: 110px; border-radius: 26px; margin-bottom: 16px; }
}
@media (min-width: 768px) {
  .home-logo { width: 180px; height: 180px; border-radius: 40px; margin-bottom: 24px; box-shadow: 0 0 70px rgba(255,255,255,0.25), 0 18px 40px rgba(0,0,0,0.35); }
}

@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.home-logo img { width: 80%; height: 80%; object-fit: contain; }

.hero-title {
  font-size: 32px;
  font-weight: 900;
  line-height: 1.15;
  color: var(--tennis-green);
  margin-bottom: 12px;
  font-family: 'Cairo', sans-serif;
}
@media (max-width: 380px) { .hero-title { font-size: 26px; } }
@media (min-width: 480px) { .hero-title { font-size: 38px; } }
@media (min-width: 768px) { .hero-title { font-size: 42px; margin-bottom: 18px; color: var(--text-light); } }
@media (min-width: 1024px) { .hero-title { font-size: 56px; } }

.hero-title span {
  background: linear-gradient(90deg, #fff 0%, var(--tennis-green) 36%, #fff 68%, #94a3b8 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 5s ease-in-out infinite;
  font-family: 'Cairo', sans-serif;
}
@media (max-width: 767px) {
  .hero-title span { color: var(--tennis-green); -webkit-text-fill-color: var(--tennis-green); }
}

.hero-title span {
  background: linear-gradient(90deg, #fff 0%, var(--tennis-green) 36%, #fff 68%, #94a3b8 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: shimmer 5s ease-in-out infinite;
}
@supports not (background-clip: text) {
  .hero-title span {
    color: var(--tennis-green);
    -webkit-text-fill-color: var(--tennis-green);
  }
}

.hero-subtitle {
  font-size: 16px;
  line-height: 1.7;
  color: #94a3b8;
  max-width: 100%;
  margin-bottom: 24px;
  font-family: 'Cairo', sans-serif;
}
@media (max-width: 380px) { .hero-subtitle { font-size: 14px; } }
@media (min-width: 480px) { .hero-subtitle { font-size: 17px; } }
@media (min-width: 768px) { .hero-subtitle { font-size: 18px; margin-bottom: 32px; max-width: 560px; } }

.hero-btns { display: flex; flex-direction: column; gap: 12px; }
@media (min-width: 640px) { .hero-btns { flex-direction: row; } }

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: var(--tennis-green);
  color: #020617;
  border: none;
  border-radius: 50px;
  padding: 16px 28px;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 0 55px rgba(220,252,45,0.35);
  transition: all 0.3s;
  text-decoration: none;
}
.hero-cta:hover {
  background: var(--tennis-green-dark);
  transform: translateY(-2px);
}

.hero-cta-sec {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.05);
  color: var(--text-light);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 50px;
  padding: 16px 28px;
  font-size: 15px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  text-decoration: none;
}
.hero-cta-sec:hover {
  border-color: rgba(220,252,45,0.6);
  color: var(--tennis-green);
}

/* Quick Links Grid */
.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 30px;
}
@media (min-width: 640px) { .quick-links { gap: 14px; margin-top: 40px; } }
@media (min-width: 1280px) { .quick-links { grid-template-columns: repeat(4, 1fr); gap: 16px; } }

.quick-link {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 110px;
  padding: 14px;
  background: rgba(255,255,255,0.035);
  border: 1px solid var(--border-white);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  transition: all 0.3s;
  text-decoration: none;
  color: inherit;
}
@media (min-width: 768px) { 
  .quick-link { min-height: 150px; padding: 20px; border-radius: 24px; }
}
.quick-link:hover {
  transform: translateY(-3px);
  border-color: rgba(220,252,45,0.4);
  background: rgba(220,252,45,0.055);
  box-shadow: 0 16px 50px rgba(0,0,0,0.35);
}

.quick-link-icon-row { display: flex; justify-content: space-between; align-items: center; }
.quick-link-icon { font-size: 18px; color: var(--tennis-green); }
.quick-link-arrow { font-size: 14px; color: var(--text-slate); transition: transform 0.3s; }
.quick-link:hover .quick-link-arrow { transform: translateX(-3px); color: var(--tennis-green); }

.quick-link-title { font-size: 13px; font-weight: 800; margin-bottom: 6px; }
@media (min-width: 768px) { .quick-link-title { font-size: 16px; margin-bottom: 8px; } }
.quick-link-desc { font-size: 10px; line-height: 1.5; color: var(--text-slate); }
@media (min-width: 768px) { .quick-link-desc { font-size: 12px; } }

/* Sections */
.sec-title { color: #fff; font-size: 22px; font-weight: 900; margin-bottom: 4px; font-family: 'Cairo', sans-serif; }
.sec-sub { color: rgba(255,255,255,.4); font-size: 13px; margin-bottom: 20px; font-family: 'Cairo', sans-serif; }

.stats-section .stats-header, .dict-section .dict-header {
  margin-bottom: 16px;
}
@media (min-width: 768px) {
  .stats-section .stats-header, .dict-section .dict-header { margin-bottom: 20px; }
}

/* ===================== CHAT PAGE ===================== */
.chat-wrap { 
  height: calc(100vh - 110px); 
  display: flex; 
  flex-direction: column; 
  max-width: 900px; 
  margin: 0 auto; 
  background: rgba(2,6,23,0.7); 
  border-radius: 14px; 
  border: 1px solid var(--border-white); 
  overflow: hidden;
}
@media (min-width: 768px) { .chat-wrap { height: calc(100vh - 96px); border-radius: 20px; } }

.chat-hdr { 
  padding: 10px 12px; 
  border-bottom: 1px solid var(--border-white); 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  background: rgba(220,252,45,0.05);
}

.chat-hdr-left { display: flex; align-items: center; gap: 8px; }
.chat-hdr-av { font-size: 20px; }
.chat-hdr-title { font-size: 12px; font-weight: 700; color: var(--text-light); font-family: 'Cairo', sans-serif; }
.chat-hdr-sub { font-size: 10px; color: var(--text-slate); font-family: 'Cairo', sans-serif; }
.online-dot { width: 6px; height: 6px; background: var(--tennis-green); border-radius: 50%; margin-right: auto; animation: pulse 2s infinite; }

.chat-body { 
  flex: 1; 
  overflow-y: auto; 
  padding: 10px 12px; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
}
@media (min-width: 768px) { .chat-body { padding: 16px 20px; gap: 12px; } }

.msg-row { display: flex; gap: 0; align-items: flex-start; max-width: 90%; animation: msg-in 0.3s ease-out; }
@keyframes msg-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.msg-row.user { align-self: flex-end; flex-direction: row-reverse; max-width: 100%; }
.msg-row.assistant { align-self: flex-start; }

.bubble { 
  padding: 10px 14px; 
  border-radius: 14px; 
  line-height: 1.6; 
  font-size: 13px; 
  word-wrap: break-word; 
  font-family: 'Cairo', sans-serif;
}
@media (min-width: 768px) { .bubble { padding: 14px 18px; border-radius: 18px; font-size: 15px; line-height: 1.7; } }
.bubble.assistant { 
  background: rgba(255,255,255,0.05); 
  border: 1px solid var(--border-white); 
  color: var(--text-light); 
}
.bubble.user { 
  background: var(--tennis-green); 
  color: #020617; 
}
@media (max-width: 1024px) { .chat-wrap { height: calc(100vh - 140px); overflow: hidden; display: flex; flex-direction: column; flex: 1; } }

.chat-hdr { 
  padding: 20px 24px; 
  border-bottom: 1px solid var(--border-white); 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  background: rgba(220,252,45,0.05);
}

.chat-hdr-left { display: flex; align-items: center; gap: 14px; }
.chat-hdr-av { font-size: 32px; }
.chat-hdr-title { font-size: 16px; font-weight: 700; color: var(--text-light); font-family: 'Cairo', sans-serif; }
.chat-hdr-sub { font-size: 12px; color: var(--text-slate); font-family: 'Cairo', sans-serif; }
.online-dot { width: 8px; height: 8px; background: var(--tennis-green); border-radius: 50%; margin-right: auto; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

.chat-body { 
  flex: 1; 
  overflow-y: auto; 
  padding: 24px; 
  display: flex; 
  flex-direction: column; 
  gap: 16px; 
}

.msg-row { display: flex; gap: 12px; align-items: flex-start; max-width: 85%; animation: msg-in 0.3s ease-out; }
@keyframes msg-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.msg-row.user { align-self: flex-end; flex-direction: row-reverse; max-width: 100%; }
.msg-row.assistant { align-self: flex-start; }

.av { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.av.bot { 
  background: #ffffff; 
  color: #020617;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.av.user { background: rgba(255,255,255,0.1); }

.bubble { 
  padding: 14px 18px; 
  border-radius: 18px; 
  line-height: 1.7; 
  font-size: 15px; 
  word-wrap: break-word; 
  font-family: 'Cairo', sans-serif;
}
.bubble.assistant { 
  background: rgba(255,255,255,0.05); 
  border: 1px solid var(--border-white); 
  color: var(--text-light); 
}
.bubble.user { 
  background: var(--tennis-green); 
  color: #020617; 
}

.typing-bub { display: flex; gap: 5px; align-items: center; padding: 12px 16px; }
.d { width: 8px; height: 8px; background: rgba(255,255,255,0.5); border-radius: 50%; animation: typing 1.4s infinite; }
.d:nth-child(2) { animation-delay: .2s; }
.d:nth-child(3) { animation-delay: .4s; }
@keyframes typing { 0%, 60%, 100% { opacity: .3; } 30% { opacity: 1; } }

.suggest-wrap { padding: 12px 16px; background: transparent; border-top: 1px solid var(--border-white); }
.suggest-lbl { font-size: 11px; color: var(--text-slate); margin-bottom: 8px; font-weight: 600; font-family: 'Cairo', sans-serif; }
.suggest-row { display: flex; gap: 6px; flex-wrap: wrap; }
.sug-btn { 
  background: rgba(220,252,45,0.08); 
  color: var(--text-light); 
  border: 1px solid rgba(220,252,45,0.2); 
  border-radius: 16px; 
  padding: 6px 10px; 
  font-size: 11px; 
  font-family: 'Cairo', sans-serif;
  transition: all 0.3s; 
}
@media (min-width: 768px) { 
  .sug-btn { padding: 8px 14px; font-size: 13px; border-radius: 20px; }
  .suggest-wrap { padding: 18px 24px; }
}

.input-bar { 
  padding: 8px 12px; 
  display: flex; 
  flex-direction: column;
  gap: 6px;
  background: rgba(15,23,42,0.5); 
  border-top: 1px solid var(--border-white); 
}
@media (min-width: 768px) { .input-bar { padding: 12px 16px; gap: 8px; flex-direction: row; } }

.voice-toggle { 
  width: 100%; 
  padding: 8px; 
  background: rgba(220,252,45,0.08); 
  border: 1px solid rgba(220,252,45,0.2); 
  border-radius: 8px; 
  color: var(--text-light); 
  font-size: 11px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: all 0.3s; 
  font-family: 'Cairo', sans-serif;
}
@media (min-width: 768px) { .voice-toggle { padding: 10px; font-size: 12px; border-radius: 10px; margin-bottom: 0; width: auto; } }
.voice-toggle:hover { background: rgba(220,252,45,0.15); border-color: rgba(220,252,45,0.4); }
.voice-toggle.active { background: linear-gradient(135deg, #ef4444, #dc2626); border-color: transparent; color: #fff; }

.input-row { display: flex; gap: 6px; }

.ta { 
  flex: 1; 
  background: rgba(255,255,255,0.05); 
  border: 1px solid var(--border-white); 
  border-radius: 8px; 
  padding: 8px 10px; 
  color: #fff; 
  resize: none; 
  font-size: 12px; 
  font-family: 'Cairo', sans-serif;
  max-height: 50px;
  min-height: 38px;
}
@media (min-width: 768px) { .ta { padding: 10px 12px; font-size: 14px; max-height: 60px; min-height: 44px; border-radius: 10px; } }
.ta::placeholder { color: var(--text-slate); }
.ta:focus { background: rgba(255,255,255,0.08); border-color: rgba(220,252,45,0.4); }

.send-btn { 
  background: var(--tennis-green); 
  color: #020617; 
  border: none; 
  border-radius: 8px; 
  padding: 8px 12px; 
  font-weight: 700; 
  transition: all 0.3s; 
  font-size: 14px;
}
@media (min-width: 768px) { .send-btn { padding: 10px 14px; font-size: 16px; border-radius: 10px; } }
.send-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(220,252,45,0.4); }
.send-btn:disabled { background: rgba(220,252,45,0.2); color: rgba(255,255,255,0.4); }

.input-hint { 
  display: none;
}

.tts-btn { 
  background: rgba(220,252,45,0.1); 
  border: 1px solid rgba(220,252,45,0.2); 
  border-radius: 8px; 
  padding: 6px 10px; 
  font-size: 14px; 
  cursor: pointer; 
  transition: all 0.2s; 
  margin-right: 8px; 
}
.tts-btn:hover { background: rgba(220,252,45,0.2); transform: scale(1.1); }

/* ===================== QUIZ PAGE ===================== */
.quiz-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.quiz-prog { font-size: 13px; color: var(--text-slate); }
.quiz-pts { font-size: 13px; color: var(--tennis-green); font-weight: 600; }
.prog-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
.prog-fill { height: 100%; background: linear-gradient(90deg, var(--tennis-green), var(--tennis-green-dark)); border-radius: 3px; transition: width .3s; }

.q-box { 
  background: rgba(255,255,255,0.02); 
  border: 1px solid var(--border-white); 
  border-radius: 24px; 
  padding: 28px; 
  margin-bottom: 20px; 
}
.q-num { font-size: 13px; color: var(--text-slate); margin-bottom: 8px; }
.q-text { font-size: 18px; color: #fff; font-weight: 600; margin-bottom: 24px; line-height: 1.6; font-family: 'Cairo', sans-serif; }
.opts-grid { display: grid; gap: 12px; }
.opt-btn { 
  background: rgba(255,255,255,0.03); 
  border: 2px solid var(--border-white); 
  border-radius: 16px; 
  padding: 16px 20px; 
  text-align: right; 
  color: var(--text-light); 
  font-size: 15px; 
  transition: all .2s; 
  display: flex; 
  align-items: center; 
  gap: 14px;
  font-family: 'Cairo', sans-serif;
}
.opt-btn:hover:not(.wrong):not(.correct) { border-color: var(--tennis-green); background: rgba(220,252,45,0.05); }
.opt-btn.correct { background: rgba(34,197,94,.15); border-color: #22c55e; color: #4ade80; }
.opt-btn.wrong { background: rgba(239,68,68,.15); border-color: #ef4444; color: #fca5a5; }
.opt-letter { 
  width: 32px; 
  height: 32px; 
  background: rgba(255,255,255,0.1); 
  border-radius: 8px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-weight: 700; 
  font-size: 14px; 
  flex-shrink: 0; 
}

.done-box { text-align: center; padding: 40px 20px; }
.done-emoji { font-size: 80px; margin-bottom: 20px; }
.done-title { font-size: 28px; font-weight: 900; margin-bottom: 20px; }
.done-score { font-size: 48px; color: var(--tennis-green); font-weight: 900; }
.done-pct { font-size: 36px; color: var(--tennis-green); margin-bottom: 12px; }
.done-msg { color: rgba(255,255,255,.7); font-size: 16px; margin-bottom: 20px; font-family: 'Cairo', sans-serif; }
.restart-btn { 
  background: var(--tennis-green); 
  color: #020617; 
  border: none; 
  border-radius: 16px; 
  padding: 14px 32px; 
  font-size: 15px; 
  font-weight: 700; 
  margin-top: 20px; 
  font-family: 'Cairo', sans-serif;
}

/* ===================== DICT PAGE ===================== */
.search { 
  width: 100%; 
  background: rgba(255,255,255,0.05); 
  border: 1px solid var(--border-white); 
  border-radius: 16px; 
  padding: 14px 18px; 
  color: #fff; 
  font-size: 15px; 
  margin-bottom: 20px; 
  font-family: 'Cairo', sans-serif;
}
.search::placeholder { color: var(--text-slate); }

.dict-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.dict-card { 
  background: rgba(255,255,255,0.02); 
  border: 1px solid var(--border-white); 
  border-radius: 16px; 
  padding: 20px; 
  text-align: right; 
  font-family: 'Cairo', sans-serif;
}
.dict-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.dict-en { color: var(--tennis-green); font-size: 16px; font-weight: 700; }
.dict-ar { color: #fff; font-size: 16px; font-weight: 700; }
.dict-def { color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; }
.no-res { text-align: center; padding: 40px; color: var(--text-slate); font-size: 16px; }

/* ===================== STATS PAGE ===================== */
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
@media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }

.stat-card { 
  background: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid var(--border-white); 
  border-radius: 16px; 
  padding: 20px; 
  text-align: center;
  transition: all 0.3s;
}
.stat-card:hover { background: rgba(255,255,255,0.06); transform: translateY(-2px); }
.stat-icon { font-size: 28px; margin-bottom: 8px; }
.stat-val { font-size: 24px; font-weight: 800; color: var(--tennis-green); margin-bottom: 4px; }
.stat-lbl { font-size: 12px; color: var(--text-slate); }

.info-box { background: rgba(255,255,255,0.02); border: 1px solid var(--border-white); border-radius: 16px; padding: 20px; margin-top: 20px; }
.info-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 16px; }
.info-grid { display: flex; flex-direction: column; gap: 8px; }
.info-row { display: flex; justify-content: space-between; gap: 8px; padding: 12px 0; border-bottom: 1px solid var(--border-white); }
.info-k { color: var(--text-slate); font-size: 14px; }
.info-v { color: #fff; font-size: 14px; font-weight: 600; }
`;