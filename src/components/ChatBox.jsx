import { useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import { createSocket } from "../api/socket";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 50;

// Joins two message lists without duplicates and keeps them oldest first
function mergeMessages(current, incoming) {
  const byId = new Map();

  for (const message of current) byId.set(message.id, message);
  for (const message of incoming) byId.set(message.id, message);

  return [...byId.values()].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

// Shows the time for today's messages, and the date too for older ones
function formatTime(dateString) {
  const date = new Date(dateString);
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (date.toDateString() === new Date().toDateString()) {
    return time;
  }
  return `${date.toLocaleDateString()} ${time}`;
}

// type is "team" or "project", id is the team id or project id
export default function ChatBox({ type, id, title }) {
  const { user } = useAuth();
  const basePath = type === "team" ? `/teams/${id}` : `/projects/${id}`;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("connecting"); // connecting, live or error
  const [statusMessage, setStatusMessage] = useState("");

  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const listRef = useRef(null);
  const skipScrollRef = useRef(false);

  // 1. Load the message history
  useEffect(() => {
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

    return () => {
      cancelled = true;
    };
  }, [basePath]);

  // 2. Connect the socket, join the room, and listen for new messages
  useEffect(() => {
    const socket = createSocket();
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

    // "connect" also runs again after a reconnect, so we rejoin the room automatically
    socket.on("connect", joinRoom);

    socket.on("new_message", (message) => {
      setMessages((current) => mergeMessages(current, [message]));
    });

    socket.on("connect_error", (err) => {
      setStatus("error");
      setStatusMessage(err.message);
    });

    socket.on("disconnect", () => {
      setStatus("connecting");
    });

    // When the chat is closed, disconnect (this also leaves the room)
    return () => {
      socket.disconnect();
    };
  }, [type, id]);

  // 3. Scroll to the newest message (but not when loading older ones)
  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }

    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages]);

  async function handleSend(event) {
    event.preventDefault();

    const content = text.trim();
    if (!content) return;

    setError("");
    setSending(true);

    try {
      const data = await api(`${basePath}/messages`, "POST", { content });

      // The socket also delivers this message, but mergeMessages removes the duplicate
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
      const data = await api(
        `${basePath}/messages?limit=${PAGE_SIZE}&before=${encodeURIComponent(oldest)}`
      );

      skipScrollRef.current = true;
      setMessages((current) => mergeMessages(current, data.data.messages));
      setHasOlder(data.data.messages.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    }

    setLoadingOlder(false);
  }

  return (
    <div className="rounded-lg bg-white shadow-sm">
      {/* Header with connection status */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <h2 className="font-semibold text-gray-800">{title}</h2>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              status === "live"
                ? "bg-green-500"
                : status === "error"
                ? "bg-red-500"
                : "bg-yellow-400"
            }`}
          />
          {status === "live" && "Live"}
          {status === "connecting" && "Connecting..."}
          {status === "error" && (statusMessage || "Connection problem")}
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex h-96 flex-col gap-2 overflow-y-auto bg-white p-4">
        {hasOlder && (
          <button
            onClick={loadOlder}
            disabled={loadingOlder}
            className="mx-auto mb-2 text-xs text-blue-600 hover:underline disabled:text-gray-400"
          >
            {loadingOlder ? "Loading..." : "Load older messages"}
          </button>
        )}

        {messages.length === 0 && (
          <p className="m-auto text-sm text-gray-400">No messages yet. Say hello!</p>
        )}

        {messages.map((message) => {
          const mine = message.sender?.id === user.id;

          return (
            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  mine ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                {!mine && (
                  <p className="mb-0.5 text-xs font-semibold text-blue-700">
                    {message.sender?.name}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p
                  className={`mt-1 text-right text-[10px] ${
                    mine ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="mx-4 mb-2 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}

      {/* Send form */}
      <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-100 p-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          className="flex-1 rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}