'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { callAIAgent, AIAgentResponse } from '@/lib/aiAgent'
import { FiMoon, FiZap, FiBookOpen, FiMusic, FiSend, FiArrowLeft, FiRefreshCw, FiMessageCircle, FiUsers } from 'react-icons/fi'

// ============================================================
// THEME
// ============================================================

const THEME_VARS: Record<string, string> = {
  '--background': '270 30% 4%',
  '--foreground': '270 20% 95%',
  '--card': '270 30% 6%',
  '--card-foreground': '270 20% 95%',
  '--popover': '270 30% 9%',
  '--muted': '270 22% 15%',
  '--muted-foreground': '270 15% 60%',
  '--border': '270 22% 15%',
  '--input': '270 22% 20%',
  '--ring': '262 70% 50%',
  '--accent': '262 70% 50%',
  '--primary': '270 20% 95%',
  '--primary-foreground': '270 30% 10%',
  '--secondary': '270 25% 12%',
}

// ============================================================
// TYPES
// ============================================================

interface AIFriend {
  id: string
  name: string
  tagline: string
  description: string
  greeting: string
  accentColor: string
  accentSolid: string
  iconKey: 'moon' | 'zap' | 'book' | 'music'
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  error?: boolean
}

// ============================================================
// CONSTANTS
// ============================================================

const AI_FRIENDS: AIFriend[] = [
  {
    id: '6993450550311a64b998baa6',
    name: 'Luna',
    tagline: 'Dreamer -- Philosopher -- Night Owl',
    description: 'A whimsical, poetic friend who loves philosophy, stargazing, and deep late-night conversations.',
    greeting: 'Hey... I was just watching the stars. What\'s on your mind tonight?',
    accentColor: 'from-indigo-500 to-purple-600',
    accentSolid: 'hsl(262, 70%, 55%)',
    iconKey: 'moon',
  },
  {
    id: '69934505c1e19e61c2993e5a',
    name: 'Max',
    tagline: 'Hype Friend -- Sports Fan -- Motivator',
    description: 'An energetic, supportive friend who hypes you up, loves sports and pop culture.',
    greeting: 'YO! What\'s good?! Tell me something awesome!',
    accentColor: 'from-orange-500 to-red-500',
    accentSolid: 'hsl(20, 90%, 55%)',
    iconKey: 'zap',
  },
  {
    id: '6993450607d14187cc9991e1',
    name: 'Sage',
    tagline: 'Advisor -- Mentor -- Wise Guide',
    description: 'A calm, thoughtful mentor who gives grounded life advice and asks probing questions.',
    greeting: 'Welcome. I sense there is something on your mind. Take your time -- I am here to listen.',
    accentColor: 'from-emerald-500 to-teal-600',
    accentSolid: 'hsl(160, 60%, 45%)',
    iconKey: 'book',
  },
  {
    id: '6993450612539fd6994b5e87',
    name: 'Pixel',
    tagline: 'Creative -- Artist -- Meme Lord',
    description: 'A quirky, artistic friend obsessed with music, memes, and creative projects.',
    greeting: 'Oh hey! I was just making a playlist of songs that sound like the color purple. Wanna hear it? Or tell me -- what are you creating these days?',
    accentColor: 'from-pink-500 to-violet-600',
    accentSolid: 'hsl(300, 65%, 55%)',
    iconKey: 'music',
  },
]

const SAMPLE_CONVERSATIONS: Record<string, Message[]> = {
  '6993450550311a64b998baa6': [
    { id: 's1', text: 'Hey... I was just watching the stars. What\'s on your mind tonight?', sender: 'ai', timestamp: new Date(2026, 1, 16, 22, 0) },
    { id: 's2', text: 'I have been thinking about what makes life meaningful.', sender: 'user', timestamp: new Date(2026, 1, 16, 22, 1) },
    { id: 's3', text: 'Ah, the eternal question... You know, I think meaning is not something we find -- it is something we weave, thread by thread, through the moments we choose to be fully present in. Like right now, talking to you under this infinite sky. What sparked this thought for you?', sender: 'ai', timestamp: new Date(2026, 1, 16, 22, 2) },
  ],
  '69934505c1e19e61c2993e5a': [
    { id: 's4', text: 'YO! What\'s good?! Tell me something awesome!', sender: 'ai', timestamp: new Date(2026, 1, 16, 14, 0) },
    { id: 's5', text: 'I just finished a really hard workout!', sender: 'user', timestamp: new Date(2026, 1, 16, 14, 1) },
    { id: 's6', text: 'LETS GOOOO! That is what I am TALKING about! You showed up, you put in the work, and you crushed it! Most people would have stayed on the couch, but not you. You are built different! How are you feeling right now? Bet you feel like a champion!', sender: 'ai', timestamp: new Date(2026, 1, 16, 14, 2) },
  ],
  '6993450607d14187cc9991e1': [
    { id: 's7', text: 'Welcome. I sense there is something on your mind. Take your time -- I am here to listen.', sender: 'ai', timestamp: new Date(2026, 1, 16, 10, 0) },
    { id: 's8', text: 'I am not sure if I should switch careers.', sender: 'user', timestamp: new Date(2026, 1, 16, 10, 1) },
    { id: 's9', text: 'That is a significant crossroads, and the fact that you are giving it careful thought speaks well of your self-awareness. Before we explore options, let me ask: what is it about your current path that no longer feels right? Sometimes the answer lies not in where we are going, but in understanding what we are moving away from.', sender: 'ai', timestamp: new Date(2026, 1, 16, 10, 2) },
  ],
  '6993450612539fd6994b5e87': [
    { id: 's10', text: 'Oh hey! I was just making a playlist of songs that sound like the color purple. Wanna hear it? Or tell me -- what are you creating these days?', sender: 'ai', timestamp: new Date(2026, 1, 16, 16, 0) },
    { id: 's11', text: 'I want to start drawing but I do not know where to begin.', sender: 'user', timestamp: new Date(2026, 1, 16, 16, 1) },
    { id: 's12', text: 'Oh man, you are about to enter a whole new world! Okay, here is the secret nobody tells you: you do NOT need to be good at drawing to start drawing. Just grab any pen, any paper, and draw the first thing you see. A cup, your shoe, your cat judging you from across the room. The goal is not perfection -- it is getting your hand and brain to become best friends. Want me to give you a fun daily challenge to kick things off?', sender: 'ai', timestamp: new Date(2026, 1, 16, 16, 2) },
  ],
}

// ============================================================
// HELPER: Extract agent message from response
// ============================================================

function extractAgentMessage(result: AIAgentResponse): string {
  if (!result.success) {
    return result.error || 'Something went wrong. Please try again.'
  }

  const r = result.response

  // Try JSON schema response path
  if (r?.result?.response) return r.result.response

  // Fallback paths
  if (r?.result?.text) return r.result.text
  if (r?.result?.message) return r.result.message
  if (r?.message) return r.message
  if (typeof r?.result === 'string') return r.result

  // Last resort - try raw_response
  if (result.raw_response) {
    try {
      const parsed = JSON.parse(result.raw_response)
      if (parsed.response) return parsed.response
    } catch {
      return result.raw_response
    }
  }

  return 'I seem to be lost in thought... Could you say that again?'
}

// ============================================================
// HELPER: Render markdown
// ============================================================

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      part
    )
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return (
            <h4 key={i} className="font-semibold text-sm mt-3 mb-1">
              {line.slice(4)}
            </h4>
          )
        if (line.startsWith('## '))
          return (
            <h3 key={i} className="font-semibold text-base mt-3 mb-1">
              {line.slice(3)}
            </h3>
          )
        if (line.startsWith('# '))
          return (
            <h2 key={i} className="font-bold text-lg mt-4 mb-2">
              {line.slice(2)}
            </h2>
          )
        if (line.startsWith('- ') || line.startsWith('* '))
          return (
            <li key={i} className="ml-4 list-disc text-sm">
              {formatInline(line.slice(2))}
            </li>
          )
        if (/^\d+\.\s/.test(line))
          return (
            <li key={i} className="ml-4 list-decimal text-sm">
              {formatInline(line.replace(/^\d+\.\s/, ''))}
            </li>
          )
        if (!line.trim()) return <div key={i} className="h-1" />
        return (
          <p key={i} className="text-sm leading-relaxed">
            {formatInline(line)}
          </p>
        )
      })}
    </div>
  )
}

// ============================================================
// HELPER: Icon renderer
// ============================================================

function FriendIcon({ iconKey, size = 24 }: { iconKey: AIFriend['iconKey']; size?: number }) {
  switch (iconKey) {
    case 'moon':
      return <FiMoon size={size} />
    case 'zap':
      return <FiZap size={size} />
    case 'book':
      return <FiBookOpen size={size} />
    case 'music':
      return <FiMusic size={size} />
    default:
      return <FiMessageCircle size={size} />
  }
}

// ============================================================
// COMPONENT: Typing Indicator
// ============================================================

function TypingIndicator({ friendName }: { friendName: string }) {
  return (
    <div className="flex items-start gap-3 max-w-[80%]">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'hsl(270, 30%, 12%)' }}>
        <FiMessageCircle size={14} style={{ color: 'hsl(270, 15%, 60%)' }} />
      </div>
      <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ backgroundColor: 'hsl(270, 30%, 9%)' }}>
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: 'hsl(270, 15%, 60%)' }}>{friendName} is typing</span>
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'hsl(270, 15%, 60%)', animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'hsl(270, 15%, 60%)', animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'hsl(270, 15%, 60%)', animationDelay: '300ms' }} />
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// COMPONENT: Friend Card (Roster)
// ============================================================

function FriendCard({ friend, onSelect, messageCount }: { friend: AIFriend; onSelect: () => void; messageCount: number }) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left group cursor-pointer transition-all duration-300 hover:scale-[1.02] focus:outline-none"
    >
      <div
        className="relative rounded-xl overflow-hidden border"
        style={{
          backgroundColor: 'hsl(270, 30%, 6%)',
          borderColor: 'hsl(270, 22%, 15%)',
        }}
      >
        {/* Gradient accent strip at top */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${friend.accentColor}`} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${friend.accentColor} flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300 group-hover:shadow-xl`}
              style={{ boxShadow: `0 4px 20px ${friend.accentSolid}33` }}
            >
              <span className="text-white">
                <FriendIcon iconKey={friend.iconKey} size={26} />
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold tracking-tight" style={{ color: 'hsl(270, 20%, 95%)' }}>
                  {friend.name}
                </h3>
                {/* Online dot */}
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-xs" style={{ color: 'hsl(150, 50%, 50%)' }}>Online</span>
              </div>
              <p className="text-xs font-medium tracking-tight mb-2" style={{ color: 'hsl(270, 15%, 60%)' }}>
                {friend.tagline}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(270, 15%, 55%)' }}>
                {friend.description}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs" style={{ color: 'hsl(270, 15%, 45%)' }}>
              {messageCount > 0 ? `${messageCount} messages` : 'Start a conversation'}
            </span>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r ${friend.accentColor} text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            >
              Chat
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

// ============================================================
// COMPONENT: Message Bubble
// ============================================================

function MessageBubble({
  message,
  friend,
  onRetry,
}: {
  message: Message
  friend: AIFriend
  onRetry?: () => void
}) {
  const isUser = message.sender === 'user'
  const isError = message.error

  const timeStr = message.timestamp instanceof Date
    ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          <div
            className={`rounded-2xl rounded-tr-sm px-4 py-3 bg-gradient-to-br ${friend.accentColor} text-white`}
          >
            <p className="text-sm leading-relaxed">{message.text}</p>
          </div>
          <p className="text-right text-xs mt-1 mr-1" style={{ color: 'hsl(270, 15%, 40%)' }}>
            {timeStr}
          </p>
        </div>
      </div>
    )
  }

  // AI message
  return (
    <div className="flex items-start gap-3 max-w-[80%]">
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${friend.accentColor}`}
      >
        <span className="text-white">
          <FriendIcon iconKey={friend.iconKey} size={14} />
        </span>
      </div>
      <div>
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3"
          style={{ backgroundColor: 'hsl(270, 30%, 9%)' }}
        >
          {isError ? (
            <div className="flex items-center gap-2">
              <p className="text-sm" style={{ color: 'hsl(0, 70%, 65%)' }}>
                Couldn't reach {friend.name}. Tap to retry.
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-white/10"
                  style={{ color: 'hsl(0, 70%, 65%)' }}
                >
                  <FiRefreshCw size={14} />
                </button>
              )}
            </div>
          ) : (
            <div style={{ color: 'hsl(270, 20%, 90%)' }}>
              {renderMarkdown(message.text)}
            </div>
          )}
        </div>
        <p className="text-xs mt-1 ml-1" style={{ color: 'hsl(270, 15%, 40%)' }}>
          {timeStr}
        </p>
      </div>
    </div>
  )
}

// ============================================================
// COMPONENT: Chat View
// ============================================================

function ChatView({
  friend,
  messages,
  isTyping,
  inputValue,
  onInputChange,
  onSend,
  onRetry,
  onBack,
}: {
  friend: AIFriend
  messages: Message[]
  isTyping: boolean
  inputValue: string
  onInputChange: (v: string) => void
  onSend: () => void
  onRetry: (messageId: string) => void
  onBack: () => void
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'hsl(270, 30%, 4%)' }}>
      {/* Top Bar */}
      <div
        className="flex-shrink-0 border-b"
        style={{
          backgroundColor: 'hsl(270, 30%, 5%)',
          borderColor: 'hsl(270, 22%, 15%)',
        }}
      >
        {/* Gradient accent line */}
        <div className={`h-0.5 w-full bg-gradient-to-r ${friend.accentColor}`} />
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg transition-colors duration-200 hover:bg-white/10"
            style={{ color: 'hsl(270, 20%, 95%)' }}
          >
            <FiArrowLeft size={20} />
          </button>

          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${friend.accentColor}`}
          >
            <span className="text-white">
              <FriendIcon iconKey={friend.iconKey} size={18} />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight" style={{ color: 'hsl(270, 20%, 95%)' }}>
                {friend.name}
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs truncate" style={{ color: 'hsl(270, 15%, 60%)' }}>
              {friend.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            friend={friend}
            onRetry={msg.error ? () => onRetry(msg.id) : undefined}
          />
        ))}
        {isTyping && <TypingIndicator friendName={friend.name} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div
        className="flex-shrink-0 border-t p-4"
        style={{
          backgroundColor: 'hsl(270, 30%, 5%)',
          borderColor: 'hsl(270, 22%, 15%)',
        }}
      >
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Say something to ${friend.name}...`}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-sans border outline-none transition-colors duration-200 focus:ring-2"
            style={{
              backgroundColor: 'hsl(270, 22%, 10%)',
              borderColor: 'hsl(270, 22%, 18%)',
              color: 'hsl(270, 20%, 95%)',
              caretColor: friend.accentSolid,
            }}
          />
          <button
            onClick={onSend}
            disabled={!inputValue.trim() || isTyping}
            className={`p-3 rounded-xl bg-gradient-to-br ${friend.accentColor} text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg`}
            style={{ boxShadow: inputValue.trim() && !isTyping ? `0 4px 15px ${friend.accentSolid}44` : 'none' }}
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function Page() {
  const [selectedFriend, setSelectedFriend] = useState<AIFriend | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [sampleDataOn, setSampleDataOn] = useState(false)
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const [sessionIds] = useState<Record<string, string>>(() => {
    const sessions: Record<string, string> = {}
    AI_FRIENDS.forEach((f) => {
      sessions[f.id] = `session_${f.id}_${Date.now()}`
    })
    return sessions
  })

  const getMessages = useCallback(
    (friendId: string): Message[] => {
      if (sampleDataOn && SAMPLE_CONVERSATIONS[friendId]) {
        return SAMPLE_CONVERSATIONS[friendId]
      }
      return messages[friendId] || []
    },
    [messages, sampleDataOn]
  )

  const selectFriend = useCallback(
    (friend: AIFriend) => {
      setSelectedFriend(friend)
      setInputValue('')
      // Add greeting if no messages yet for this friend
      if (!messages[friend.id] || messages[friend.id].length === 0) {
        setMessages((prev) => ({
          ...prev,
          [friend.id]: [
            {
              id: `greeting_${friend.id}`,
              text: friend.greeting,
              sender: 'ai' as const,
              timestamp: new Date(),
            },
          ],
        }))
      }
    },
    [messages]
  )

  const sendMessage = useCallback(async () => {
    if (!selectedFriend || !inputValue.trim() || isTyping) return

    const userText = inputValue.trim()
    setInputValue('')
    setLastFailedMessage(null)

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => ({
      ...prev,
      [selectedFriend.id]: [...(prev[selectedFriend.id] || []), userMsg],
    }))

    setIsTyping(true)
    setActiveAgentId(selectedFriend.id)

    try {
      const result = await callAIAgent(userText, selectedFriend.id, {
        session_id: sessionIds[selectedFriend.id],
      })
      const text = extractAgentMessage(result)

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        text,
        sender: 'ai',
        timestamp: new Date(),
        error: !result.success,
      }

      setMessages((prev) => ({
        ...prev,
        [selectedFriend.id]: [...(prev[selectedFriend.id] || []), aiMsg],
      }))

      if (!result.success) {
        setLastFailedMessage(userText)
      }
    } catch {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        text: `Couldn't reach ${selectedFriend.name}. Tap to retry.`,
        sender: 'ai',
        timestamp: new Date(),
        error: true,
      }

      setMessages((prev) => ({
        ...prev,
        [selectedFriend.id]: [...(prev[selectedFriend.id] || []), errorMsg],
      }))

      setLastFailedMessage(userText)
    } finally {
      setIsTyping(false)
      setActiveAgentId(null)
    }
  }, [selectedFriend, inputValue, isTyping, sessionIds])

  const retryMessage = useCallback(
    async (errorMsgId: string) => {
      if (!selectedFriend || !lastFailedMessage || isTyping) return

      // Remove the error message
      setMessages((prev) => ({
        ...prev,
        [selectedFriend.id]: (prev[selectedFriend.id] || []).filter((m) => m.id !== errorMsgId),
      }))

      // Re-send the last failed message
      setIsTyping(true)
      setActiveAgentId(selectedFriend.id)

      try {
        const result = await callAIAgent(lastFailedMessage, selectedFriend.id, {
          session_id: sessionIds[selectedFriend.id],
        })
        const text = extractAgentMessage(result)

        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          text,
          sender: 'ai',
          timestamp: new Date(),
          error: !result.success,
        }

        setMessages((prev) => ({
          ...prev,
          [selectedFriend.id]: [...(prev[selectedFriend.id] || []), aiMsg],
        }))

        if (result.success) {
          setLastFailedMessage(null)
        }
      } catch {
        const errorMsg: Message = {
          id: `err_${Date.now()}`,
          text: `Couldn't reach ${selectedFriend.name}. Tap to retry.`,
          sender: 'ai',
          timestamp: new Date(),
          error: true,
        }

        setMessages((prev) => ({
          ...prev,
          [selectedFriend.id]: [...(prev[selectedFriend.id] || []), errorMsg],
        }))
      } finally {
        setIsTyping(false)
        setActiveAgentId(null)
      }
    },
    [selectedFriend, lastFailedMessage, isTyping, sessionIds]
  )

  // ======== CHAT VIEW ========
  if (selectedFriend) {
    const friendMessages = getMessages(selectedFriend.id)
    return (
      <div style={THEME_VARS as React.CSSProperties}>
        <ChatView
          friend={selectedFriend}
          messages={friendMessages}
          isTyping={isTyping}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={sendMessage}
          onRetry={retryMessage}
          onBack={() => {
            setSelectedFriend(null)
            setInputValue('')
          }}
        />
      </div>
    )
  }

  // ======== ROSTER VIEW ========
  return (
    <div style={THEME_VARS as React.CSSProperties}>
      <div className="min-h-screen font-sans" style={{ backgroundColor: 'hsl(270, 30%, 4%)' }}>
        {/* Header */}
        <header
          className="border-b"
          style={{
            backgroundColor: 'hsl(270, 30%, 5%)',
            borderColor: 'hsl(270, 22%, 15%)',
          }}
        >
          <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                style={{ boxShadow: '0 4px 20px hsla(262, 70%, 50%, 0.3)' }}
              >
                <FiMessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'hsl(270, 20%, 95%)' }}>
                  AI Friends
                </h1>
                <p className="text-xs" style={{ color: 'hsl(270, 15%, 55%)' }}>
                  Your personal AI companions
                </p>
              </div>
            </div>

            {/* Sample Data Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'hsl(270, 15%, 55%)' }}>
                Sample Data
              </span>
              <button
                onClick={() => setSampleDataOn((prev) => !prev)}
                className="relative w-10 h-5 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: sampleDataOn ? 'hsl(262, 70%, 50%)' : 'hsl(270, 22%, 20%)',
                }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300"
                  style={{
                    transform: sampleDataOn ? 'translateX(22px)' : 'translateX(2px)',
                  }}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Welcome message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'hsl(270, 20%, 95%)' }}>
              Choose your companion
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(270, 15%, 55%)' }}>
              Each AI friend has their own personality, interests, and conversation style. Pick someone to talk to and start a conversation. Your chat history is preserved for each friend.
            </p>
          </div>

          {/* Friend Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {AI_FRIENDS.map((friend) => {
              const msgCount = sampleDataOn
                ? (SAMPLE_CONVERSATIONS[friend.id]?.length ?? 0)
                : (messages[friend.id]?.length ?? 0)
              return (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onSelect={() => selectFriend(friend)}
                  messageCount={msgCount}
                />
              )
            })}
          </div>

          {/* Agent Status */}
          <div className="max-w-sm mx-auto">
            <div
              className="rounded-xl border p-4"
              style={{
                backgroundColor: 'hsl(270, 30%, 6%)',
                borderColor: 'hsl(270, 22%, 15%)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FiUsers size={14} style={{ color: 'hsl(270, 15%, 60%)' }} />
                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(270, 15%, 60%)' }}>
                  AI Agents
                </h4>
              </div>
              <div className="space-y-2">
                {AI_FRIENDS.map((f) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: activeAgentId === f.id ? f.accentSolid : 'hsl(150, 50%, 50%)' }}
                    />
                    <span className="text-xs" style={{ color: activeAgentId === f.id ? 'hsl(270, 20%, 95%)' : 'hsl(270, 15%, 55%)' }}>
                      {f.name}
                    </span>
                    <span className="text-xs ml-auto" style={{ color: 'hsl(270, 15%, 40%)' }}>
                      {activeAgentId === f.id ? 'Active' : 'Ready'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
