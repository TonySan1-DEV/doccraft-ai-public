import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'

import { toast } from 'react-hot-toast'
import { MessageCircle, Send, ChevronRight, ChevronDown } from 'lucide-react'
import io from 'socket.io-client'

interface Comment {
  id: string
  sectionId: string
  userId: string
  userName: string
  text: string
  range: { start: number; end: number }
  createdAt: string
  replies?: Comment[]
}

interface CommentSystemProps {
  sectionId: string
  sectionContent: string
  collaborators: string[] // userIds
}

const socket = io()

const CommentSystem: React.FC<CommentSystemProps> = ({ sectionId, sectionContent, collaborators }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null)
  const [showBubble, setShowBubble] = useState(false)
  const [commentText, setCommentText] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)
  const [hoveredRange, setHoveredRange] = useState<{ start: number; end: number } | null>(null)

  // Permissions
  const canComment = user && (collaborators.includes(user.id) || user.role === 'owner')

  // Fetch comments on mount
  useEffect(() => {
    fetch(`/api/comments?sectionId=${sectionId}`)
      .then(res => res.json())
      .then(setComments)
  }, [sectionId])

  // Socket listeners
  useEffect(() => {
    socket.on('comment:new', (comment: Comment) => {
      if (comment.sectionId === sectionId) {
        setComments(prev => [...prev, comment])
      }
    })
    return () => {
      socket.off('comment:new')
    }
  }, [sectionId])

  // Handle text selection
  const handleMouseUp = () => {
    if (!canComment) return
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      if (range && contentRef.current && contentRef.current.contains(range.commonAncestorContainer)) {
        const start = range.startOffset
        const end = range.endOffset
        if (start !== end) {
          setSelection({ start, end })
          setShowBubble(true)
        } else {
          setShowBubble(false)
        }
      } else {
        setShowBubble(false)
      }
    }
  }

  // Submit comment
  const handleCommentSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to add comments');
      return;
    }

    if (!selection || !commentText.trim()) return
    const payload = {
      sectionId,
      userId: user.id,
      userName: user.email || 'Anonymous',
      text: commentText,
      range: selection
    }
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const newComment: Comment = await res.json()
    socket.emit('comment:new', newComment)
    setComments(prev => [...prev, newComment])
    setCommentText('')
    setSelection(null)
    setShowBubble(false)
  }

  // Render content with highlights
  const renderContent = () => {
    if (!comments.length) return sectionContent
    let nodes: React.ReactNode[] = []
    let lastIdx = 0
    comments.forEach((c, _i) => {
      if (c.range.start > lastIdx) {
        nodes.push(sectionContent.slice(lastIdx, c.range.start))
      }
      nodes.push(
        <span
          key={c.id}
          className={`bg-yellow-200 dark:bg-yellow-400/30 rounded px-1 cursor-pointer ${hoveredRange && hoveredRange.start === c.range.start && hoveredRange.end === c.range.end ? 'ring-2 ring-blue-400' : ''}`}
          onMouseEnter={() => setHoveredRange(c.range)}
          onMouseLeave={() => setHoveredRange(null)}
        >
          {sectionContent.slice(c.range.start, c.range.end)}
          {hoveredRange && hoveredRange.start === c.range.start && hoveredRange.end === c.range.end && (
            <div className="absolute z-50 bg-white dark:bg-zinc-900 border rounded shadow px-3 py-2 mt-2 text-sm">
              <div className="font-semibold mb-1">{c.userName}</div>
              <div>{c.text}</div>
            </div>
          )}
        </span>
      )
      lastIdx = c.range.end
    })
    if (lastIdx < sectionContent.length) {
      nodes.push(sectionContent.slice(lastIdx))
    }
    return nodes
  }

  // Sidebar threads
  const renderThreads = () => (
    <div className="w-80 bg-white dark:bg-zinc-900 border-l h-full p-4 overflow-y-auto">
      <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageCircle /> Comments</h2>
      {comments.length === 0 && <div className="text-zinc-500">No comments yet.</div>}
      {comments.map(c => (
        <div key={c.id} className="mb-4">
          <div className="font-semibold">{c.userName}</div>
          <div className="text-sm text-zinc-700 dark:text-zinc-200 mb-1">{c.text}</div>
          <div className="text-xs text-zinc-400">{new Date(c.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className="prose dark:prose-invert max-w-none cursor-text"
        onMouseUp={handleMouseUp}
        style={{ position: 'relative' }}
      >
        {renderContent()}
      </div>
      {showBubble && selection && (
        <div className="absolute z-50 left-1/2 top-0 -translate-x-1/2 mt-2 bg-white dark:bg-zinc-900 border rounded shadow px-3 py-2 flex items-center gap-2">
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="Add a comment..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            autoFocus
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded p-1"
            onClick={handleCommentSubmit}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
      <button
        className="fixed top-1/2 right-0 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-l px-3 py-2 flex items-center gap-1 shadow"
        onClick={() => setSidebarOpen(v => !v)}
        style={{ transform: 'translateY(-50%)' }}
      >
        {sidebarOpen ? <ChevronRight /> : <ChevronDown />} <MessageCircle />
      </button>
      {sidebarOpen && (
        <div className="fixed top-0 right-0 h-full z-50">
          {renderThreads()}
        </div>
      )}
    </div>
  )
}

export default CommentSystem 