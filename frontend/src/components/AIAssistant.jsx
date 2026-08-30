import { useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? ''

const quickPrompts = [
  'Where is Aadhaar section?',
  'What documents for DU Admission?',
  'UPSC Civil Services DAF documents checklist',
  'IIT JoSAA mandatory document checklist',
  'How to fix Aadhaar name spelling mismatch?',
  'What is Gap Year Certificate format?',
]

export default function AIAssistant({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '👋 Hello! I am **RUDOC AI Co-Pilot**.\nAsk me anything about Indian college admissions, government portals (Aadhaar, UPSC, Passport), document procurement, or finding sections in the app!',
    },
  ])
  const [inputQuery, setInputQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery
    if (!textToSend.trim()) return

    const userMessage = { sender: 'user', text: textToSend }
    setMessages((prev) => [...prev, userMessage])
    setInputQuery('')
    setIsTyping(true)

    try {
      const response = await fetch(`${API_URL}/api/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage = {
          sender: 'bot',
          text: data.answer,
          actionTab: data.actionTab,
          actionLabel: data.actionLabel,
          relatedDocs: data.relatedDocs,
          suggestedAction: data.suggestedAction,
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        throw new Error('API Error')
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'I can guide you! Try asking: "Where is Aadhaar section?", "What docs for DU admission?", or "UPSC documents checklist".',
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleActionClick = (tab) => {
    if (onNavigate && tab) {
      onNavigate(tab)
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        className="ai-copilot-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src="/logo.png" alt="RUDOC" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
        <span>RUDOC AI Assistant</span>
      </button>

      {/* Expandable Chatbot Drawer */}
      {isOpen && (
        <div className="ai-copilot-modal">
          {/* Header */}
          <div className="ai-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/logo.png"
                alt="RUDOC"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                }}
              />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>RUDOC Document Co-Pilot</h4>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>🟢 Active Intelligent Assistant</span>
              </div>
            </div>
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px',
              }}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Messages Feed */}
          <div className="ai-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.sender}`}>
                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                {/* Direct Action Trigger Button */}
                {msg.actionTab && (
                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      className="ai-action-btn"
                      onClick={() => handleActionClick(msg.actionTab)}
                    >
                      {msg.actionLabel || '👉 View Section in App'}
                    </button>
                  </div>
                )}

                {msg.relatedDocs && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
                      📑 Mentioned Documents:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                      {msg.relatedDocs.map((d, i) => (
                        <span key={i} className="badge badge-teal" style={{ fontSize: '10px' }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {msg.suggestedAction && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '11px',
                    color: 'var(--primary)',
                    fontWeight: '700',
                    background: 'var(--primary-light)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                  }}>
                    💡 {msg.suggestedAction}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="ai-message bot" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                <span>🤖 Searching document rules & answering...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="ai-prompts">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                className="ai-prompt-chip"
                onClick={() => handleSend(p)}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="ai-input-bar">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything (e.g. where is aadhaar, DU admission, UPSC docs)..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-glass)',
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '13px',
              }}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleSend()}
              disabled={!inputQuery.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
