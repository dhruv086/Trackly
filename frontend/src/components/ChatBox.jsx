import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getSocket } from '../utils/socket';
import API from '../utils/api';
import { Send, Loader2, MessageCircle, Trash2 } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

// ─── helpers ─────────────────────────────────────────────────────────────────

const avatarColors = [
  'bg-indigo-500','bg-violet-500','bg-rose-500','bg-emerald-500',
  'bg-amber-500','bg-sky-500','bg-pink-500','bg-teal-500',
];
function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
}

function dateLabel(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d))     return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
}

function timeLabel(dateStr) {
  return format(new Date(dateStr), 'h:mm a');
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * @param mode       "project" | "task"
 * @param contextId  projectId | taskId
 * @param members    project members or task assignees (for typing indicator display)
 */
const ChatBox = ({ mode, contextId, members = [] }) => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});   // { username: timeout }
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const textRef = useRef(null);
  const typingTimerRef = useRef(null);

  const endpoint = mode === 'project' ? 'project' : 'task';
  const joinEvent  = mode === 'project' ? 'join:project'         : 'join:task';
  const leaveEvent = mode === 'project' ? 'leave:project'        : 'leave:task';
  const sendEvent  = mode === 'project' ? 'chat:project'         : 'chat:task';
  const recvEvent  = mode === 'project' ? 'chat:project:message' : 'chat:task:message';
  const typSend    = mode === 'project' ? 'typing:project'       : 'typing:task';
  const typRecv    = mode === 'project' ? 'typing:project'       : 'typing:task';
  const payload    = mode === 'project' ? { projectId: contextId } : { taskId: contextId };

  // Scroll to bottom
  const scrollDown = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // Load history
  useEffect(() => {
    if (!contextId) return;
    setLoading(true);
    setMessages([]);
    API.get(`/chat/${endpoint}/${contextId}`)
      .then((r) => setMessages(r.data.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [contextId, endpoint]);

  // Socket: join room, listen for new messages + typing
  useEffect(() => {
    if (!contextId) return;

    const tryAttach = () => {
      const socket = getSocket();
      if (!socket?.connected) return false;

      socket.emit(joinEvent, contextId);

      const onMessage = (msg) => {
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollDown();
      };

      const onTyping = ({ username, isTyping }) => {
        if (username === currentUser?.username) return;
        setTypingUsers((prev) => {
          const next = { ...prev };
          if (isTyping) {
            next[username] = true;
          } else {
            delete next[username];
          }
          return next;
        });
      };

      socket.on(recvEvent, onMessage);
      socket.on(typRecv,   onTyping);

      return () => {
        socket.emit(leaveEvent, contextId);
        socket.off(recvEvent, onMessage);
        socket.off(typRecv,   onTyping);
      };
    };

    // Retry until socket is ready
    let cleanup = null;
    const interval = setInterval(() => {
      cleanup = tryAttach();
      if (cleanup) clearInterval(interval);
    }, 300);

    return () => {
      clearInterval(interval);
      if (typeof cleanup === 'function') cleanup();
    };
  }, [contextId, joinEvent, leaveEvent, recvEvent, typRecv, scrollDown, currentUser]);

  useEffect(() => scrollDown(), [messages, scrollDown]);

  // Send a message
  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const socket = getSocket();
    if (!socket?.connected) return;
    setSending(true);
    socket.emit(sendEvent, { ...payload, text: trimmed });
    setText('');
    setSending(false);
    textRef.current?.focus();
  };

  // Typing indicator
  const handleTyping = (v) => {
    setText(v);
    const socket = getSocket();
    if (!socket?.connected) return;
    socket.emit(typSend, { ...payload, isTyping: true });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit(typSend, { ...payload, isTyping: false });
    }, 1500);
  };

  // Delete a message
  const handleDelete = async (msgId) => {
    try {
      await API.delete(`/chat/${msgId}`);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    } catch (_) {}
  };

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const label = dateLabel(msg.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(msg);
    return acc;
  }, {});

  const typingList = Object.keys(typingUsers);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Message area ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-indigo-400 animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle size={36} className="text-slate-200 mb-3" />
            <p className="text-sm font-bold text-slate-400">No messages yet</p>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Be the first to say something!
            </p>
          </div>
        )}

        {Object.entries(grouped).map(([dateStr, msgs]) => (
          <div key={dateStr}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t border-slate-100" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                {dateStr}
              </span>
              <div className="flex-1 border-t border-slate-100" />
            </div>

            {/* Messages */}
            {msgs.map((msg) => {
              const isMe = msg.sender?._id === currentUser?._id || msg.sender?._id === currentUser?.id;
              const username = msg.sender?.username || '?';
              return (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 mb-2 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  {!isMe && (
                    <div
                      className={`w-7 h-7 rounded-full ${avatarColor(username)} flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 mb-1`}
                      title={username}
                    >
                      {username[0]?.toUpperCase()}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    {/* Sender name (only for others) */}
                    {!isMe && (
                      <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1">{username}</span>
                    )}

                    {/* Bubble */}
                    <div className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-white border border-slate-100 text-slate-800 rounded-bl-md'
                    }`}>
                      {msg.text}
                      {/* Delete button (mine only) */}
                      {isMe && (
                        <button
                          onClick={() => handleDelete(msg._id)}
                          className="absolute -top-2 -left-2 hidden group-hover:flex w-5 h-5 bg-white border border-rose-200 rounded-full items-center justify-center text-rose-500 shadow-sm hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={9} />
                        </button>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className={`text-[10px] font-medium mt-1 ${isMe ? 'text-slate-400' : 'text-slate-300'} px-1`}>
                      {timeLabel(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingList.length > 0 && (
          <div className="flex items-center gap-2 py-1 px-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold italic">
              {typingList.join(', ')} {typingList.length === 1 ? 'is' : 'are'} typing…
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-slate-100 px-4 py-3 bg-white">
        <div className="flex items-end gap-2">
          {/* My avatar */}
          <div className={`w-7 h-7 rounded-full ${avatarColor(currentUser?.username || '')} flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 mb-0.5`}>
            {currentUser?.username?.[0]?.toUpperCase() || '?'}
          </div>

          <div className="flex-1 flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
            <textarea
              ref={textRef}
              rows={1}
              placeholder="Write a message…"
              value={text}
              onChange={(e) => {
                handleTyping(e.target.value);
                // auto-grow
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 bg-transparent text-sm text-slate-800 resize-none outline-none placeholder:text-slate-400 font-medium leading-relaxed min-h-[20px]"
              style={{ height: '20px' }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-md shadow-indigo-200"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-[10px] text-slate-300 font-medium mt-1.5 ml-9">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatBox;
