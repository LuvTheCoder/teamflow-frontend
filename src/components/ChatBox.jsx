import { useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import { getSocket } from "../api/socket";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 50;

function mergeMessages(current, incoming) {
  const byId = new Map();
  for (const message of current) byId.set(message.id, message);
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === new Date().toDateString()) return time;
  return `${date.toLocaleDateString()} ${time}`;
}

export default function ChatBox({ type, id, title }) {
  const { user } = useAuth();
  const basePath = type === "team" ? `/teams/${id}` : `/projects/${id}`;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("connecting");
  const [statusMessage, setStatusMessage] = useState("");

  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const listRef = useRef(null);
  const skipScrollRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    async function loadHistory() {
      try {
        const data = await api(`${basePath}/messages?limit=${PAGE_SIZE}`);
        if (cancelled) return;
        setMessages((current) => mergeMessages(current, data.data.messages));
        setHasOlder(data.data.messages.length === PAGE_SIZE);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    loadHistory();
    return () => { cancelled = true; };
  }, [basePath, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const socket = getSocket();
    const room = { type, id };

    function joinRoom() {
      socket.emit("join_chat", room, (result) => {
        if (result.ok) {
          setStatus("live");
          setStatusMessage("");
        } else {
          setStatus("error");
          setStatusMessage(result.message);
        }
      });
    }

    function handleNewMessage(message) {
      setMessages((current) => mergeMessages(current, [message]));
    }

    if (socket.connected) joinRoom();

    socket.on("connect", joinRoom);
    socket.on("new_message", handleNewMessage);
    socket.on("connect_error", (err) => { setStatus("error"); setStatusMessage(err.message); });
    socket.on("disconnect", () => setStatus("connecting"));

    return () => {
      socket.emit("leave_chat", room);
      socket.off("connect", joinRoom);
      socket.off("new_message", handleNewMessage);
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, [type, id, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, isOpen]);

  async function handleSend(event) {
    event.preventDefault();
    const content = text.trim();
    if (!content) return;

    setError("");
    setSending(true);

    try {
      const data = await api(`${basePath}/messages`, "POST", { content });
      setMessages((current) => mergeMessages(current, [data.data.message]));
      setText("");
    } catch (err) {
      setError(err.message);
    }

    setSending(false);
  }

  async function loadOlder() {
    if (messages.length === 0) return;
    setError("");
    setLoadingOlder(true);

    try {
      const oldest = messages[0].created_at;
      const data = await api(`${basePath}/messages?limit=${PAGE_SIZE}&before=${encodeURIComponent(oldest)}`);
      skipScrollRef.current = true;
      setMessages((current) => mergeMessages(current, data.data.messages));
      setHasOlder(data.data.messages.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    }

    setLoadingOlder(false);
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-xl border-2 border-[#0E1330] bg-[#2A3BFF] px-4 py-3 font-display text-xs font-extrabold text-white shadow-[4px_4px_0_#0E1330] hover:bg-[#1f2ed6] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
      >
        <span>💬</span>
        <span>{isOpen ? "Close Chat" : `Open ${type === "team" ? "Team" : "Project"} Chat`}</span>
      </button>

      {/* Slide-over Chat Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l-2 border-[#0E1330] bg-white shadow-[-6px_0_0_#0E1330]">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#0E1330] bg-[#0E1330] p-4 text-white">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-extrabold uppercase tracking-wide">
                {title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold">
                <span className={`h-2 w-2 rounded-full ${status === "live" ? "bg-[#CBFF4D]" : "bg-amber-400"}`} />
                {status.toUpperCase()}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-white/20 px-2 py-0.5 text-xs font-bold hover:bg-white/10"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div ref={listRef} className="flex-1 overflow-y-auto bg-[#F4F6FF] p-4 flex flex-col gap-3">
            {hasOlder && (
              <button
                onClick={loadOlder}
                disabled={loadingOlder}
                className="mx-auto rounded border border-[#0E1330] bg-white px-3 py-1 font-display text-[10px] font-extrabold uppercase text-[#2A3BFF] shadow-[2px_2px_0_#0E1330]"
              >
                {loadingOlder ? "Loading..." : "Load Older Messages"}
              </button>
            )}

            {messages.length === 0 && (
              <div className="m-auto text-center font-display text-xs font-bold text-slate-500">
                No messages yet. Start the conversation!
              </div>
            )}

            {messages.map((msg) => {
              const mine = msg.sender?.id === user.id;
              return (
                <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-xl border-2 border-[#0E1330] p-3 shadow-[2px_2px_0_#0E1330] ${
                      mine ? "bg-[#2A3BFF] text-white" : "bg-white text-[#0E1330]"
                    }`}
                  >
                    {!mine && (
                      <p className="mb-0.5 text-[10px] font-extrabold text-[#2A3BFF] uppercase">
                        {msg.sender?.name}
                      </p>
                    )}
                    <p className="text-xs font-semibold leading-relaxed">{msg.content}</p>
                    <p className={`mt-1 text-right text-[9px] font-bold ${mine ? "text-blue-200" : "text-slate-400"}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSend} className="border-t-2 border-[#0E1330] bg-white p-3 flex gap-2">
            <input
              type="text"
              placeholder="Type message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 rounded-lg border-2 border-[#0E1330] bg-[#F4F6FF] px-3 py-2 text-xs font-semibold text-[#0E1330] outline-none focus:bg-white focus:ring-2 focus:ring-[#2A3BFF]"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="rounded-lg border-2 border-[#0E1330] bg-[#CBFF4D] px-4 py-2 font-display text-xs font-extrabold uppercase text-[#0E1330] shadow-[2px_2px_0_#0E1330] hover:bg-[#d9ff7a] disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}