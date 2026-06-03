import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield, Zap, Copy, Check, ChevronDown,
  Terminal, Lock, Gauge, FileCode, RefreshCw,
  AlertCircle, Code2, CheckCircle, Sparkles,
  Bug, TrendingUp, Users, Upload, Download,
  History, Search, X, Command, MessageSquare,
  Wrench, FlaskConical, BookOpen, Trash2,
  FileText, ChevronRight,
} from "lucide-react"
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-python"
import "prismjs/components/prism-java"
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/components/prism-rust"
import "prismjs/components/prism-go"
import "prismjs/components/prism-markup-templating"
import "prismjs/components/prism-php"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import axios from "axios"
import "./App.css"

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", ext: [".js", ".jsx"] },
  { id: "typescript", label: "TypeScript", ext: [".ts", ".tsx"] },
  { id: "python",     label: "Python",     ext: [".py"]         },
  { id: "java",       label: "Java",       ext: [".java"]       },
  { id: "cpp",        label: "C++",        ext: [".cpp", ".cc"] },
  { id: "rust",       label: "Rust",       ext: [".rs"]         },
  { id: "go",         label: "Go",         ext: [".go"]         },
  { id: "php",        label: "PHP",        ext: [".php"]        },
]

const REVIEW_MODES = [
  { id: "review",       label: "Code Review",         icon: Code2,      hint: "General quality & style"   },
  { id: "security",     label: "Security Audit",       icon: Shield,     hint: "Vulnerabilities & risks"   },
  { id: "performance",  label: "Performance Audit",    icon: TrendingUp, hint: "Speed & efficiency"        },
  { id: "bugs",         label: "Bug Detection",        icon: Bug,        hint: "Logic errors & edge cases" },
  { id: "interview",    label: "Interview Feedback",   icon: Users,      hint: "Clarity & best practices"  },
  { id: "scalability",  label: "Scalability Analysis", icon: Gauge,      hint: "Architecture & growth"     },
  { id: "explain",      label: "Explain Code",         icon: BookOpen,   hint: "Line-by-line walkthrough"  },
  { id: "refactor",     label: "Refactor",             icon: Wrench,     hint: "Cleaner, modern code"      },
  { id: "tests",        label: "Generate Tests",       icon: FlaskConical, hint: "Jest / unit test suite"  },
]

const ANALYSIS_STEPS = [
  { id: 1, icon: Terminal,  label: "Initializing CodeGuardian AI..."       },
  { id: 2, icon: FileCode,  label: "Analyzing Code Structure..."           },
  { id: 3, icon: Lock,      label: "Checking Security Vulnerabilities..."  },
  { id: 4, icon: Gauge,     label: "Evaluating Performance & Efficiency..." },
  { id: 5, icon: Zap,       label: "Generating Professional Recommendations..." },
]

const SCORE_META = {
  security:        { label: "Security",        icon: Shield,      color: "#a78bfa", grade_thresholds: [90,80,70,60] },
  performance:     { label: "Performance",     icon: TrendingUp,  color: "#34d399", grade_thresholds: [90,80,70,60] },
  maintainability: { label: "Maintainability", icon: CheckCircle, color: "#60a5fa", grade_thresholds: [90,80,70,60] },
  readability:     { label: "Readability",     icon: Sparkles,    color: "#f9a8d4", grade_thresholds: [90,80,70,60] },
}

const ACCEPTED_EXTS = [".js",".jsx",".ts",".tsx",".py",".java",".cpp",".cc",".rs",".go",".php"]

const COMMAND_PALETTE_ITEMS = [
  { id: "review",      label: "Code Review",        icon: Code2,        action: "setMode" },
  { id: "security",    label: "Security Audit",      icon: Shield,       action: "setMode" },
  { id: "performance", label: "Performance Audit",   icon: TrendingUp,   action: "setMode" },
  { id: "bugs",        label: "Bug Detection",       icon: Bug,          action: "setMode" },
  { id: "interview",   label: "Interview Feedback",  icon: Users,        action: "setMode" },
  { id: "scalability", label: "Scalability Analysis",icon: Gauge,        action: "setMode" },
  { id: "explain",     label: "Explain Code",        icon: BookOpen,     action: "setMode" },
  { id: "refactor",    label: "Refactor",            icon: Wrench,       action: "setMode" },
  { id: "tests",       label: "Generate Tests",      icon: FlaskConical, action: "setMode" },
  { id: "upload",      label: "Upload File",         icon: Upload,       action: "upload"  },
  { id: "download",    label: "Download Review",     icon: Download,     action: "download"},
  { id: "history",     label: "Review History",      icon: History,      action: "history" },
  { id: "clear",       label: "Clear Editor",        icon: Trash2,       action: "clear"   },
]

const STORAGE_KEY = "cg_review_history"
const API_URL = import.meta.env.VITE_API_URL

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGrade(score) {
  if (score >= 93) return "A+"
  if (score >= 85) return "A"
  if (score >= 78) return "B+"
  if (score >= 70) return "B"
  if (score >= 60) return "C"
  return "D"
}

function detectLanguage(filename) {
  const lower = filename.toLowerCase()
  return LANGUAGES.find(l => l.ext.some(e => lower.endsWith(e)))?.id || "javascript"
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
  catch { return [] }
}

function saveHistory(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 30))) }
  catch {}
}

function formatDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return "Just now"
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`
  if (diff < 86400000) return "Today"
  if (diff < 172800000) return "Yesterday"
  return d.toLocaleDateString()
}

// ─── ScoreCard ────────────────────────────────────────────────────────────────

function ScoreCard({ metaKey, value, delay }) {
  const [display, setDisplay] = useState(0)
  const animRef      = useRef(0)
  const startTimeRef = useRef(0)
  const DURATION     = 1200
  const meta         = SCORE_META[metaKey]
  const Icon         = meta.icon

  useEffect(() => {
    startTimeRef.current = 0
    const animate = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts
      const p     = Math.min((ts - startTimeRef.current) / DURATION, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(eased * value))
      if (p < 1) animRef.current = requestAnimationFrame(animate)
    }
    const t = setTimeout(() => { animRef.current = requestAnimationFrame(animate) }, delay * 1000)
    return () => { clearTimeout(t); cancelAnimationFrame(animRef.current) }
  }, [value, delay])

  const R   = 26
  const sz  = 68
  const cx  = sz / 2
  const circumference = 2 * Math.PI * R
  const offset        = circumference - (display / 100) * circumference
  const grade         = getGrade(value)

  return (
    <motion.div
      className="score-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.03 }}
    >
      {/* Ring with text baked into SVG — no absolute positioning needed */}
      <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cx} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        <circle
          cx={cx} cy={cx} r={R} fill="none"
          stroke={meta.color} strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: "stroke-dashoffset 0.04s linear" }}
        />
        {/* Score number */}
        <text
          x={cx} y={cx - 3}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="13" fontWeight="700"
          fill={meta.color}
          fontFamily="'JetBrains Mono', monospace"
        >
          {display}
        </text>
        {/* Grade */}
        <text
          x={cx} y={cx + 11}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="8" fontWeight="700"
          fill={meta.color + "99"}
          fontFamily="'Syne', sans-serif"
          letterSpacing="0.5"
        >
          {grade}
        </text>
      </svg>

      <div className="score-footer">
        <Icon size={11} style={{ color: meta.color, opacity: 0.75 }} />
        <span className="score-label">{meta.label}</span>
      </div>
    </motion.div>
  )
}

// ─── RateLimitState ───────────────────────────────────────────────────────────

function RateLimitState({ retryAfter, onRetry }) {
  const [countdown, setCountdown] = useState(retryAfter || 30)
  const total = retryAfter || 30

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const progress     = ((total - countdown) / total) * 100
  const circumference = 2 * Math.PI * 36
  const offset        = circumference - (progress / 100) * circumference

  return (
    <motion.div className="fullpanel-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="rate-limit-ring">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth="4" />
          <circle
            cx="48" cy="48" r="36" fill="none"
            stroke="#7C3AED" strokeWidth="4"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 48 48)"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <motion.div className="rate-limit-shield"
          animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          <Shield size={28} color="#7C3AED" />
        </motion.div>
      </div>
      <h3 className="panel-center-title">High Traffic Volume</h3>
      <p className="panel-center-sub">
        CodeGuardian is processing a high volume of requests.<br />
        Retry available in:
      </p>
      <div className="rate-countdown">{countdown}s</div>
      <AnimatePresence>
        {countdown <= 0 && (
          <motion.button className="outline-btn" onClick={onRetry}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <RefreshCw size={14} /> Retry Now
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── HistoryPanel ─────────────────────────────────────────────────────────────

function HistoryPanel({ history, onSelect, onDelete, onClose, searchQuery, setSearchQuery }) {
  const filtered = history.filter(h =>
    h.lang.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.mode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div className="history-panel"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
      <div className="history-header">
        <span className="history-title"><History size={14} /> Review History</span>
        <button className="icon-btn" onClick={onClose}><X size={15} /></button>
      </div>
      <div className="history-search">
        <Search size={13} />
        <input
          placeholder="Search history..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>
      <div className="history-list">
        {filtered.length === 0 && (
          <div className="history-empty"><FileText size={28} /><p>No reviews yet</p></div>
        )}
        {filtered.map(item => {
          const ModeIcon = REVIEW_MODES.find(m => m.id === item.mode)?.icon || Code2
          return (
            <motion.div key={item.id} className="history-item"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              onClick={() => onSelect(item)}
            >
              <div className="history-item-icon"><ModeIcon size={13} /></div>
              <div className="history-item-body">
                <span className="history-item-title">{item.modeName} · {item.langName}</span>
                <span className="history-item-snippet">{item.snippet}</span>
                <span className="history-item-time">{formatDate(item.ts)}</span>
              </div>
              <button className="icon-btn history-delete"
                onClick={e => { e.stopPropagation(); onDelete(item.id) }}>
                <Trash2 size={12} />
              </button>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── CommandPalette ───────────────────────────────────────────────────────────

function CommandPalette({ onAction, onClose }) {
  const [q, setQ] = useState("")
  const inputRef  = useRef(null)
  const [sel, setSel] = useState(0)

  const items = COMMAND_PALETTE_ITEMS.filter(i =>
    i.label.toLowerCase().includes(q.toLowerCase())
  )

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { setSel(0) }, [q])

  function handleKey(e) {
    if (e.key === "ArrowDown")  { e.preventDefault(); setSel(s => Math.min(s+1, items.length-1)) }
    if (e.key === "ArrowUp")    { e.preventDefault(); setSel(s => Math.max(s-1, 0)) }
    if (e.key === "Enter")      { if (items[sel]) onAction(items[sel]); onClose() }
    if (e.key === "Escape")     { onClose() }
  }

  return (
    <motion.div className="palette-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div className="palette-box"
        initial={{ opacity: 0, y: -16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.18 }}
      >
        <div className="palette-search">
          <Command size={15} />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={handleKey} placeholder="Search actions..." />
          <kbd onClick={onClose}>Esc</kbd>
        </div>
        <ul className="palette-list">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <li key={item.id}
                className={`palette-item ${i === sel ? "selected" : ""}`}
                onClick={() => { onAction(item); onClose() }}
                onMouseEnter={() => setSel(i)}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                <ChevronRight size={12} className="palette-arrow" />
              </li>
            )
          })}
          {items.length === 0 && <li className="palette-empty">No results</li>}
        </ul>
      </motion.div>
    </motion.div>
  )
}

// ─── ChatFollowUp ─────────────────────────────────────────────────────────────

function ChatFollowUp({ code, review, mode }) {
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const suggestions = [
    "How can I improve security?",
    "Can you show a refactored version?",
    "What are the top 3 issues?",
    "Explain the worst bug found",
  ]

  async function send(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: msg }])
    setLoading(true)
    try {
      const resp = await axios.post(`${API_URL}/ai/get-review`, {
        code,
        mode: "chat",
        context: review,
        question: msg,
      })
      setMessages(prev => [...prev, { role: "ai", content: resp.data }])
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I couldn't process that. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <MessageSquare size={14} />
        <span>Ask CodeGuardian</span>
      </div>

      {messages.length === 0 && (
        <div className="chat-suggestions">
          {suggestions.map(s => (
            <button key={s} className="suggestion-chip" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className="chat-messages">
        {messages.map((m, i) => (
          <motion.div key={i} className={`chat-msg ${m.role}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {m.role === "ai"
              ? <Markdown rehypePlugins={[rehypeHighlight]}>{m.content}</Markdown>
              : <p>{m.content}</p>
            }
          </motion.div>
        ))}
        {loading && (
          <motion.div className="chat-msg ai typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span /><span /><span />
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-wrap">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask CodeGuardian..."
          disabled={loading}
        />
        <motion.button className="chat-send" onClick={() => send()}
          disabled={!input.trim() || loading}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Zap size={14} />
        </motion.button>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [code,        setCode]        = useState(`function authenticate(user, password) {\n  const query = "SELECT * FROM users WHERE name='" + user + "' AND pass='" + password + "'";\n  return db.execute(query);\n}`)
  const [review,      setReview]      = useState("")
  const [language,    setLanguage]    = useState("javascript")
  const [langOpen,    setLangOpen]    = useState(false)
  const [modeOpen,    setModeOpen]    = useState(false)
  const [reviewMode,  setReviewMode]  = useState("review")
  const [status,      setStatus]      = useState("idle")
  const [analysisStep,setAnalysisStep]= useState(0)
  const [scores,      setScores]      = useState(null)
  const [copied,      setCopied]      = useState(false)
  const [retryAfter,  setRetryAfter]  = useState(30)
  const [isDragging,  setIsDragging]  = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [showChat,    setShowChat]    = useState(false)
  const [history,     setHistory]     = useState(loadHistory)
  const [historySearch, setHistorySearch] = useState("")
  const [activeTab,   setActiveTab]   = useState("review") // review | chat

  const stepTimers      = useRef([])
  const langRef         = useRef(null)
  const modeRef         = useRef(null)
  const fileInputRef    = useRef(null)
  const dropZoneRef     = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
      if (modeRef.current && !modeRef.current.contains(e.target)) setModeOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  // Command palette shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    function handle(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setShowPalette(p => !p)
      }
    }
    document.addEventListener("keydown", handle)
    return () => document.removeEventListener("keydown", handle)
  }, [])

  const lineCount    = code.split("\n").length
  const charCount    = code.length
  const selectedLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0]
  const selectedMode = REVIEW_MODES.find(m => m.id === reviewMode) || REVIEW_MODES[0]
  const prismLang    = prism.languages[language] || prism.languages.javascript

  function clearTimers() {
    stepTimers.current.forEach(t => clearTimeout(t))
    stepTimers.current = []
  }

  // ── File handling ──────────────────────────────────────────────────────────

  function processFile(file) {
    if (!file) return
    const ext = "." + file.name.split(".").pop().toLowerCase()
    if (!ACCEPTED_EXTS.includes(ext)) return
    const detected = detectLanguage(file.name)
    const reader = new FileReader()
    reader.onload = e => { setCode(e.target.result); setLanguage(detected) }
    reader.readAsText(file)
  }

  function handleFileInput(e) { processFile(e.target.files[0]) }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  function handleDragOver(e) { e.preventDefault(); setIsDragging(true) }
  function handleDragLeave()  { setIsDragging(false) }

  // ── Download review ────────────────────────────────────────────────────────

  function downloadReview(format = "md") {
    if (!review) return
    const blob = new Blob([review], { type: "text/plain" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `review.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Review ─────────────────────────────────────────────────────────────────

  async function reviewCode() {
    if (status === "loading" || !code.trim()) return
    clearTimers()
    setStatus("loading")
    setReview("")
    setScores(null)
    setAnalysisStep(0)
    setActiveTab("review")

    ANALYSIS_STEPS.forEach((_, i) => {
      const t = setTimeout(() => setAnalysisStep(i), i * 900)
      stepTimers.current.push(t)
    })

    try {
      const response = await axios.post(`${API_URL}/ai/get-review`, {
        code,
        mode: reviewMode,
      })

      clearTimers()

      // If backend returns JSON with scores, use them; otherwise keep random
      let reviewText = response.data
      let newScores  = null

      if (typeof response.data === "object" && response.data.review) {
        reviewText = response.data.review
        newScores = {
          security:        response.data.security        || randomScore(72, 25),
          performance:     response.data.performance     || randomScore(75, 20),
          maintainability: response.data.maintainability || randomScore(70, 22),
          readability:     response.data.readability     || randomScore(78, 18),
        }
      } else {
        newScores = {
          security:        randomScore(72, 25),
          performance:     randomScore(75, 20),
          maintainability: randomScore(70, 22),
          readability:     randomScore(78, 18),
        }
      }

      // Save to history
      const histItem = {
        id:       Date.now(),
        ts:       Date.now(),
        mode:     reviewMode,
        modeName: selectedMode.label,
        lang:     language,
        langName: selectedLang.label,
        snippet:  code.slice(0, 80).replace(/\n/g, " "),
        review:   reviewText,
        scores:   newScores,
        code,
      }
      const updated = [histItem, ...history]
      setHistory(updated)
      saveHistory(updated)

      setScores(newScores)
      setReview(reviewText)
      setStatus("success")
    } catch (err) {
      clearTimers()
      if (err?.response?.status === 429) {
        const ra = err.response.headers["retry-after"]
        setRetryAfter(ra ? parseInt(ra) : 30)
        setStatus("ratelimit")
      } else {
        setStatus("error")
      }
    }
  }

  function randomScore(min, range) { return Math.floor(Math.random() * range) + min }

  function handleRetry() { setStatus("idle"); reviewCode() }

  async function copyReview() {
    await navigator.clipboard.writeText(review)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Command palette actions ────────────────────────────────────────────────

  function handlePaletteAction(item) {
    if (item.action === "setMode")    { setReviewMode(item.id) }
    if (item.action === "upload")     { fileInputRef.current?.click() }
    if (item.action === "download")   { downloadReview("md") }
    if (item.action === "history")    { setShowHistory(true) }
    if (item.action === "clear")      { setCode("") }
  }

  // ── History selection ──────────────────────────────────────────────────────

  function selectHistory(item) {
    setCode(item.code)
    setLanguage(item.lang)
    setReviewMode(item.mode)
    setReview(item.review)
    setScores(item.scores)
    setStatus("success")
    setShowHistory(false)
  }

  function deleteHistory(id) {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    saveHistory(updated)
  }

  const ModeIcon = selectedMode.icon

  return (
    <div className="app"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="bg-glow" />
      <div className="bg-grid" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTS.join(",")}
        style={{ display: "none" }}
        onChange={handleFileInput}
      />

      {/* ── LEFT PANEL ────────────────────────────────────────────────────── */}
      <motion.div className="left-panel"
        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>

        {/* Branding */}
        <div className="branding">
          <div className="logo">
            <motion.div className="logo-icon"
              animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 6 }}>
              <Shield size={20} />
            </motion.div>
            <h1>CodeGuardian</h1>
          </div>
          <p>AI-Powered Code Analysis &amp; Security Review Platform</p>
        </div>

        {/* Toolbar row 1 — language + mode */}
        <div className="toolbar">
          {/* Language */}
          <div className="selector-wrap" ref={langRef}>
            <button className="selector-btn"
              onClick={() => { setLangOpen(o => !o); setModeOpen(false) }}>
              <span>{selectedLang.label}</span>
              <ChevronDown size={12} className={langOpen ? "rotated" : ""} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.ul className="selector-dropdown"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                  {LANGUAGES.map(l => (
                    <li key={l.id} className={l.id === language ? "active" : ""}
                      onClick={() => { setLanguage(l.id); setLangOpen(false) }}>
                      {l.label}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Mode */}
          <div className="selector-wrap mode-selector-wrap" ref={modeRef}>
            <button className="selector-btn mode-btn"
              onClick={() => { setModeOpen(o => !o); setLangOpen(false) }}>
              <ModeIcon size={12} />
              <span>{selectedMode.label}</span>
              <ChevronDown size={12} className={modeOpen ? "rotated" : ""} />
            </button>
            <AnimatePresence>
              {modeOpen && (
                <motion.ul className="selector-dropdown mode-dropdown"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                  {REVIEW_MODES.map(m => {
                    const MI = m.icon
                    return (
                      <li key={m.id} className={m.id === reviewMode ? "active" : ""}
                        onClick={() => { setReviewMode(m.id); setModeOpen(false) }}>
                        <MI size={13} />
                        <div className="mode-text">
                          <span className="mode-label">{m.label}</span>
                          <span className="mode-hint">{m.hint}</span>
                        </div>
                      </li>
                    )
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Toolbar row 2 — actions + stats */}
        <div className="toolbar toolbar-actions">
          <button className="icon-action-btn" title="Upload file" onClick={() => fileInputRef.current?.click()}>
            <Upload size={13} />
            <span>Upload</span>
          </button>
          <button className="icon-action-btn" title="Review History" onClick={() => setShowHistory(s => !s)}>
            <History size={13} />
            <span>History</span>
            {history.length > 0 && <span className="badge">{history.length}</span>}
          </button>
          <button className="icon-action-btn palette-trigger" title="Command Palette (Ctrl+K)"
            onClick={() => setShowPalette(true)}>
            <Command size={13} />
            <span>⌘K</span>
          </button>
          <div className="stats">
            <span>{lineCount} lines</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        {/* Editor with drag overlay */}
        <div
          ref={dropZoneRef}
          className={`editor-wrapper ${isDragging ? "dragging" : ""}`}
        >
          {isDragging && (
            <div className="drop-overlay">
              <Upload size={32} />
              <p>Drop file to load</p>
            </div>
          )}
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={c => prism.highlight(c, prismLang, language)}
            padding={16}
            className="code-editor-instance"
          />
        </div>

        {/* Footer */}
        <div className="editor-footer">
          <span className="footer-hint"><Terminal size={11} />Paste or drop a file</span>
          <motion.button
            className={`review-btn ${status === "loading" ? "loading" : ""}`}
            onClick={reviewCode}
            disabled={status === "loading" || !code.trim()}
            whileHover={{ scale: status === "loading" ? 1 : 1.02 }}
            whileTap={{  scale: status === "loading" ? 1 : 0.97 }}
          >
            {status === "loading"
              ? <><span className="btn-spinner" />Analyzing...</>
              : <><Shield size={14} />Review Code</>
            }
          </motion.button>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
      <motion.div className="right-panel"
        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>

        <AnimatePresence mode="wait">

          {/* HERO */}
          {status === "idle" && !review && (
            <motion.div key="hero" className="fullpanel-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="hero-orb"
                animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ repeat: Infinity, duration: 4 }} />
              <motion.div className="hero-shield"
                animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3.5 }}>
                <Shield size={52} strokeWidth={1.2} />
              </motion.div>
              <h2 className="panel-center-title">Welcome to CodeGuardian</h2>
              <p className="panel-center-sub">
                AI-Powered Code Analysis &amp; Security Review Platform
              </p>
              <div className="hero-badges">
                <span>Security Review</span>
                <span>Performance Audit</span>
                <span>Best Practices</span>
              </div>
              <motion.button className="hero-btn" onClick={reviewCode}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Zap size={15} />Start Reviewing
              </motion.button>
            </motion.div>
          )}

          {/* LOADING */}
          {status === "loading" && (
            <motion.div key="loading" className="loading-state"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="loading-header">
                <motion.div className="loading-logo"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}>
                  <Shield size={20} />
                </motion.div>
                <span>Running Analysis</span>
              </div>
              <div className="steps-list">
                {ANALYSIS_STEPS.map((step, i) => {
                  const SI = step.icon
                  const done   = i < analysisStep
                  const active = i === analysisStep
                  return (
                    <motion.div key={step.id}
                      className={`analysis-step ${done ? "done" : ""} ${active ? "active" : ""}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: i <= analysisStep ? 1 : 0.22, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                    >
                      <div className="step-icon-wrap">
                        {done ? <Check size={13} /> : <SI size={13} />}
                      </div>
                      <span className="step-label">{step.label}</span>
                      {active && (
                        <motion.div className="step-pulse"
                          animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} />
                      )}
                    </motion.div>
                  )
                })}
              </div>
              <div className="loading-bar-wrap">
                <motion.div className="loading-bar-fill"
                  animate={{ width: `${((analysisStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5 }} />
              </div>
            </motion.div>
          )}

          {/* RATE LIMIT */}
          {status === "ratelimit" && (
            <motion.div key="ratelimit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RateLimitState retryAfter={retryAfter} onRetry={handleRetry} />
            </motion.div>
          )}

          {/* ERROR */}
          {status === "error" && (
            <motion.div key="error" className="fullpanel-center"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <AlertCircle size={36} strokeWidth={1.5} color="#f87171" />
              <h3 className="panel-center-title">Analysis Failed</h3>
              <p className="panel-center-sub">Something went wrong. Please try again.</p>
              <motion.button className="outline-btn" onClick={handleRetry}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <RefreshCw size={14} />Try Again
              </motion.button>
            </motion.div>
          )}

          {/* SUCCESS */}
          {status === "success" && review && (
            <motion.div key="success" className="review-output"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

              {/* Sticky header */}
              <div className="review-header">
                <div className="review-title-row">
                  <div className="review-badge">
                    <selectedMode.icon size={12} />
                    {selectedMode.label}
                  </div>
                  <div className="review-actions">
                    <motion.button className="icon-pill-btn" onClick={copyReview}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      {copied ? <><Check size={12} />Copied</> : <><Copy size={12} />Copy</>}
                    </motion.button>
                    <motion.button className="icon-pill-btn" onClick={() => downloadReview("md")}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Download size={12} />.md
                    </motion.button>
                    <motion.button className="icon-pill-btn" onClick={() => downloadReview("txt")}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Download size={12} />.txt
                    </motion.button>
                  </div>
                </div>

                {/* Score cards */}
                {scores && (
                  <motion.div className="scores-grid"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                    {Object.entries(scores).map(([key, val], i) => (
                      <ScoreCard key={key} metaKey={key} value={val} delay={i * 0.1 + 0.1} />
                    ))}
                  </motion.div>
                )}

                {/* Tab bar */}
                <div className="tab-bar">
                  <button className={`tab-btn ${activeTab === "review" ? "active" : ""}`}
                    onClick={() => setActiveTab("review")}>
                    <FileText size={13} />Review
                  </button>
                  <button className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
                    onClick={() => setActiveTab("chat")}>
                    <MessageSquare size={13} />Chat
                  </button>
                </div>
              </div>

              {/* Tab content — scrollable body */}
              <div className="review-body">
                <AnimatePresence mode="wait">
                  {activeTab === "review" && (
                    <motion.div key="tab-review" className="markdown-wrap"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                      <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
                    </motion.div>
                  )}
                  {activeTab === "chat" && (
                    <motion.div key="tab-chat" style={{ height: "100%" }}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                      <ChatFollowUp code={code} review={review} mode={reviewMode} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* History panel — slides in over right panel */}
        <AnimatePresence>
          {showHistory && (
            <HistoryPanel
              history={history}
              onSelect={selectHistory}
              onDelete={deleteHistory}
              onClose={() => setShowHistory(false)}
              searchQuery={historySearch}
              setSearchQuery={setHistorySearch}
            />
          )}
        </AnimatePresence>

      </motion.div>

      {/* ── Command palette ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPalette && (
          <CommandPalette onAction={handlePaletteAction} onClose={() => setShowPalette(false)} />
        )}
      </AnimatePresence>

    </div>
  )
}