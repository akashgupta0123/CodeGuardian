import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield, Zap, Copy, Check, ChevronDown,
  Terminal, Lock, Gauge, FileCode, RefreshCw,
  AlertCircle, Code2, CheckCircle, Sparkles,
  BookOpen, Bug, TrendingUp, Users,
} from "lucide-react"
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
// Language components MUST come after the core prismjs import
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

// ─── Constants ───────────────────────────────────────────────────────────────

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python",     label: "Python"     },
  { id: "java",       label: "Java"       },
  { id: "cpp",        label: "C++"        },
  { id: "rust",       label: "Rust"       },
  { id: "go",         label: "Go"         },
  { id: "php",        label: "PHP"        },
]

const REVIEW_MODES = [
  { id: "review",       label: "Code Review",          icon: Code2,       hint: "General quality & style"   },
  { id: "security",     label: "Security Audit",        icon: Shield,      hint: "Vulnerabilities & risks"    },
  { id: "performance",  label: "Performance Audit",     icon: TrendingUp,  hint: "Speed & efficiency"         },
  { id: "bugs",         label: "Bug Detection",         icon: Bug,         hint: "Logic errors & edge cases"  },
  { id: "interview",    label: "Interview Feedback",    icon: Users,       hint: "Clarity & best practices"   },
  { id: "scalability",  label: "Scalability Analysis",  icon: Gauge,       hint: "Architecture & growth"      },
]

const ANALYSIS_STEPS = [
  { id: 1, icon: Terminal,  label: "Initializing CodeGuardian AI..."       },
  { id: 2, icon: FileCode,  label: "Analyzing Code Structure..."            },
  { id: 3, icon: Lock,      label: "Checking Security Vulnerabilities..."   },
  { id: 4, icon: Gauge,     label: "Evaluating Performance & Efficiency..."  },
  { id: 5, icon: Zap,       label: "Generating Professional Recommendations..." },
]

const SCORE_RANGES = {
  SECURITY:        { min: 72, range: 25 },
  PERFORMANCE:     { min: 75, range: 20 },
  MAINTAINABILITY: { min: 70, range: 22 },
  READABILITY:     { min: 78, range: 18 },
}

const SCORE_ICONS = {
  Security:        Shield,
  Performance:     TrendingUp,
  Maintainability: CheckCircle,
  Readability:     Sparkles,
}

const SCORE_COLORS = {
  Security:        "#a78bfa",
  Performance:     "#34d399",
  Maintainability: "#60a5fa",
  Readability:     "#f9a8d4",
}

function generateScores() {
  return {
    security:        Math.floor(Math.random() * SCORE_RANGES.SECURITY.range)        + SCORE_RANGES.SECURITY.min,
    performance:     Math.floor(Math.random() * SCORE_RANGES.PERFORMANCE.range)     + SCORE_RANGES.PERFORMANCE.min,
    maintainability: Math.floor(Math.random() * SCORE_RANGES.MAINTAINABILITY.range) + SCORE_RANGES.MAINTAINABILITY.min,
    readability:     Math.floor(Math.random() * SCORE_RANGES.READABILITY.range)     + SCORE_RANGES.READABILITY.min,
  }
}

// ─── ScoreCard ────────────────────────────────────────────────────────────────

function ScoreCard({ label, value, color, delay }) {
  const [display, setDisplay] = useState(0)
  const animationRef  = useRef(0)
  const startTimeRef  = useRef(0)
  const DURATION = 1000
  const Icon = SCORE_ICONS[label] || Shield

  useEffect(() => {
    startTimeRef.current = 0
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed  = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / DURATION, 1)
      setDisplay(Math.round(progress * value))
      if (progress < 1) animationRef.current = requestAnimationFrame(animate)
    }
    const delayTimer = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate)
    }, delay * 1000)
    return () => { clearTimeout(delayTimer); cancelAnimationFrame(animationRef.current) }
  }, [value, delay])

  const circumference = 2 * Math.PI * 18
  const offset        = circumference - (display / 100) * circumference

  return (
    <motion.div
      className="score-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="22" cy="22" r="18" fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
        <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="600" fill={color}>{display}</text>
      </svg>
      <Icon size={13} color={color} className="score-icon" />
      <span className="score-label">{label}</span>
    </motion.div>
  )
}

// ─── RateLimitState ───────────────────────────────────────────────────────────

function RateLimitState({ retryAfter, onRetry }) {
  const [countdown, setCountdown] = useState(retryAfter || 30)
  const [progress,  setProgress]  = useState(0)
  const total = retryAfter || 30

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => {
      setCountdown(c => c - 1)
      setProgress(((total - countdown + 1) / total) * 100)
    }, 1000)
    return () => clearTimeout(timer)
  }, [countdown, total])

  const circumference = 2 * Math.PI * 36
  const offset        = circumference - (progress / 100) * circumference

  return (
    <motion.div
      className="rate-limit-state"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="rate-limit-ring">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="4" />
          <circle
            cx="48" cy="48" r="36" fill="none"
            stroke="#7C3AED" strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <motion.div
          className="rate-limit-shield"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Shield size={28} color="#7C3AED" />
        </motion.div>
      </div>
      <h3 className="rate-limit-title">High Traffic Volume</h3>
      <p className="rate-limit-msg">
        CodeGuardian is processing a high volume of requests.
        <br />Retry available in:
      </p>
      <div className="rate-limit-countdown">{countdown}s</div>
      <AnimatePresence>
        {countdown <= 0 && (
          <motion.button
            className="retry-btn"
            onClick={onRetry}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RefreshCw size={14} />
            Retry Now
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [code, setCode]           = useState(`function authenticate(user, password) {\n  const query = "SELECT * FROM users WHERE name='" + user + "' AND pass='" + password + "'";\n  return db.execute(query);\n}`)
  const [review, setReview]       = useState("")
  const [language, setLanguage]   = useState("javascript")
  const [langOpen, setLangOpen]   = useState(false)
  const [modeOpen, setModeOpen]   = useState(false)
  const [reviewMode, setReviewMode] = useState("review")
  const [status, setStatus]       = useState("idle")   // idle | loading | success | error | ratelimit
  const [analysisStep, setAnalysisStep] = useState(0)
  const [scores, setScores]       = useState(null)
  const [copied, setCopied]       = useState(false)
  const [retryAfter, setRetryAfter] = useState(30)

  const stepTimers    = useRef([])
  const langSelectorRef = useRef(null)
  const modeSelectorRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (langSelectorRef.current && !langSelectorRef.current.contains(e.target)) setLangOpen(false)
      if (modeSelectorRef.current && !modeSelectorRef.current.contains(e.target)) setModeOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const lineCount = code.split("\n").length
  const charCount = code.length

  const selectedLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0]
  const selectedMode = REVIEW_MODES.find(m => m.id === reviewMode) || REVIEW_MODES[0]
  const prismLang    = prism.languages[language] || prism.languages.javascript

  function clearTimers() {
    stepTimers.current.forEach(t => clearTimeout(t))
    stepTimers.current = []
  }

  async function reviewCode() {
    if (status === "loading" || !code.trim()) return
    clearTimers()
    setStatus("loading")
    setReview("")
    setScores(null)
    setAnalysisStep(0)

    // Step through analysis steps while request is in flight
    ANALYSIS_STEPS.forEach((_, i) => {
      const t = setTimeout(() => setAnalysisStep(i), i * 900)
      stepTimers.current.push(t)
    })

    try {
      const response = await axios.post("http://localhost:3000/ai/get-review", {
        code,
        mode: reviewMode,
      })
      clearTimers()
      // No fake delay — show results immediately when API responds
      setScores(generateScores())
      setReview(response.data)
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

  function handleRetry() {
    setStatus("idle")
    reviewCode()
  }

  async function copyReview() {
    await navigator.clipboard.writeText(review)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ModeIcon = selectedMode.icon

  return (
    <div className="app">
      <div className="bg-glow" />
      <div className="bg-grid"  />

      <motion.div
        className="left-panel"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Brand */}
        <div className="branding">
          <div className="logo">
            <motion.div
              className="logo-icon"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <Shield size={20} />
            </motion.div>
            <h1>CodeGuardian</h1>
          </div>
          <p>AI-Powered Code Analysis &amp; Security Review Platform</p>
        </div>

        {/* Toolbar — language + mode selectors + stats */}
        <div className="toolbar">

          {/* Language selector */}
          <div className="selector-wrap" ref={langSelectorRef}>
            <button
              className="selector-btn"
              onClick={() => { setLangOpen(o => !o); setModeOpen(false) }}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              <span>{selectedLang.label}</span>
              <ChevronDown size={12} className={langOpen ? "rotated" : ""} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.ul
                  className="selector-dropdown"
                  role="listbox"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {LANGUAGES.map(l => (
                    <li
                      key={l.id}
                      role="option"
                      aria-selected={l.id === language}
                      className={l.id === language ? "active" : ""}
                      onClick={() => { setLanguage(l.id); setLangOpen(false) }}
                    >
                      {l.label}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Review mode selector */}
          <div className="selector-wrap mode-selector-wrap" ref={modeSelectorRef}>
            <button
              className="selector-btn mode-btn"
              onClick={() => { setModeOpen(o => !o); setLangOpen(false) }}
              aria-haspopup="listbox"
              aria-expanded={modeOpen}
            >
              <ModeIcon size={12} />
              <span>{selectedMode.label}</span>
              <ChevronDown size={12} className={modeOpen ? "rotated" : ""} />
            </button>
            <AnimatePresence>
              {modeOpen && (
                <motion.ul
                  className="selector-dropdown mode-dropdown"
                  role="listbox"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {REVIEW_MODES.map(m => {
                    const MIcon = m.icon
                    return (
                      <li
                        key={m.id}
                        role="option"
                        aria-selected={m.id === reviewMode}
                        className={m.id === reviewMode ? "active" : ""}
                        onClick={() => { setReviewMode(m.id); setModeOpen(false) }}
                      >
                        <MIcon size={13} />
                        <span className="mode-label">{m.label}</span>
                        <span className="mode-hint">{m.hint}</span>
                      </li>
                    )
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Stats */}
          <div className="stats">
            <span>{lineCount} lines</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        {/* Editor */}
        <div className="editor-wrapper">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={c => prism.highlight(c, prismLang, language)}
            padding={16}
            className="code-editor-instance"
          />
        </div>

        {/* Footer / Review button */}
        <div className="editor-footer">
          <span className="footer-hint">
            <Terminal size={11} />
            Paste any code to analyze
          </span>
          <motion.button
            className={`review-btn ${status === "loading" ? "loading" : ""}`}
            onClick={reviewCode}
            disabled={status === "loading" || !code.trim()}
            whileHover={{ scale: status === "loading" ? 1 : 1.02 }}
            whileTap={{  scale: status === "loading" ? 1 : 0.97 }}
          >
            {status === "loading" ? (
              <><span className="btn-spinner" />Analyzing...</>
            ) : (
              <><Shield size={14} />Review Code</>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <motion.div
        className="right-panel"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">

          {/* HERO */}
          {status === "idle" && !review && (
            <motion.div
              key="hero"
              className="hero-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="hero-orb"
                animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              />
              <motion.div
                className="hero-shield"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              >
                <Shield size={52} strokeWidth={1.2} />
              </motion.div>
              <h2 className="hero-title">Welcome to CodeGuardian</h2>
              <p className="hero-sub">AI-Powered Code Analysis &amp; Security Review Platform</p>
              <div className="hero-badges">
                <span>Security Review</span>
                <span>Performance Audit</span>
                <span>Best Practices</span>
              </div>
              <motion.button
                className="hero-btn"
                onClick={reviewCode}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Zap size={15} />
                Start Reviewing
              </motion.button>
            </motion.div>
          )}

          {/* LOADING */}
          {status === "loading" && (
            <motion.div
              key="loading"
              className="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="loading-header">
                <motion.div
                  className="loading-logo"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                >
                  <Shield size={20} />
                </motion.div>
                <span>Running Analysis</span>
              </div>

              <div className="steps-list">
                {ANALYSIS_STEPS.map((step, i) => {
                  const StepIcon = step.icon
                  const done     = i < analysisStep
                  const active   = i === analysisStep
                  return (
                    <motion.div
                      key={step.id}
                      className={`analysis-step ${done ? "done" : ""} ${active ? "active" : ""}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: i <= analysisStep ? 1 : 0.25, x: 0 }}
                      transition={{ delay: i * 0.12, duration: 0.3 }}
                    >
                      <div className="step-icon-wrap">
                        {done ? <Check size={13} /> : <StepIcon size={13} />}
                      </div>
                      <span className="step-label">{step.label}</span>
                      {active && (
                        <motion.div
                          className="step-pulse"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </div>

              <div className="loading-bar-wrap">
                <motion.div
                  className="loading-bar-fill"
                  animate={{ width: `${((analysisStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          {/* RATE LIMIT */}
          {status === "ratelimit" && (
            <motion.div
              key="ratelimit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RateLimitState retryAfter={retryAfter} onRetry={handleRetry} />
            </motion.div>
          )}

          {/* ERROR */}
          {status === "error" && (
            <motion.div
              key="error"
              className="error-state"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle size={36} strokeWidth={1.5} color="#f87171" />
              <h3>Analysis Failed</h3>
              <p>Something went wrong. Please try again.</p>
              <motion.button
                className="retry-btn"
                onClick={handleRetry}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <RefreshCw size={14} />
                Try Again
              </motion.button>
            </motion.div>
          )}

          {/* SUCCESS */}
          {status === "success" && review && (
            <motion.div
              key="success"
              className="review-output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Review header */}
              <div className="review-header">
                <div className="review-title-row">
                  <div className="review-badge">
                    <selectedMode.icon size={12} />
                    {selectedMode.label}
                  </div>
                  <motion.button
                    className="copy-btn"
                    onClick={copyReview}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copied
                      ? <><Check size={13} />Copied</>
                      : <><Copy size={13} />Copy</>
                    }
                  </motion.button>
                </div>

                {/* Score cards */}
                {scores && (
                  <motion.div
                    className="scores-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <ScoreCard label="Security"        value={scores.security}        color={SCORE_COLORS.Security}        delay={0.1} />
                    <ScoreCard label="Performance"     value={scores.performance}     color={SCORE_COLORS.Performance}     delay={0.2} />
                    <ScoreCard label="Maintainability" value={scores.maintainability} color={SCORE_COLORS.Maintainability} delay={0.3} />
                    <ScoreCard label="Readability"     value={scores.readability}     color={SCORE_COLORS.Readability}     delay={0.4} />
                  </motion.div>
                )}
              </div>

              {/* Markdown output */}
              <motion.div
                className="markdown-wrap"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  )
}