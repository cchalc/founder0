"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Brain,
  FileCode2,
  MessageCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "agent" | "user";
  type: "thinking" | "file_write" | "message" | "error";
  content: string;
  timestamp: number;
}

interface ChatPanelProps {
  messages: Message[];
  status: "idle" | "running" | "complete" | "error";
  onSendMessage: (message: string) => void;
  projectName: string;
}

const TYPE_CONFIG = {
  thinking: {
    icon: Brain,
    label: "Thinking",
    className: "text-violet-400/80",
    dotColor: "bg-violet-400",
  },
  file_write: {
    icon: FileCode2,
    label: "Writing",
    className: "text-emerald-400/80",
    dotColor: "bg-emerald-400",
  },
  message: {
    icon: MessageCircle,
    label: "Message",
    className: "text-sky-400/80",
    dotColor: "bg-sky-400",
  },
  error: {
    icon: AlertCircle,
    label: "Error",
    className: "text-red-400/80",
    dotColor: "bg-red-400",
  },
} as const;

export default function ChatPanel({
  messages,
  status,
  onSendMessage,
  projectName,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || status === "running") return;
    onSendMessage(trimmed);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              status === "running"
                ? "bg-emerald-400 animate-pulse"
                : status === "complete"
                ? "bg-sky-400"
                : status === "error"
                ? "bg-red-400"
                : "bg-white/20"
            )}
          />
          <h2 className="text-sm font-semibold tracking-tight text-white/90">
            {projectName || "New Project"}
          </h2>
        </div>
        <span className="ml-auto font-mono text-[11px] text-white/30">
          {status === "running"
            ? "building..."
            : status === "complete"
            ? "done"
            : status === "error"
            ? "error"
            : "ready"}
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => {
            if (msg.role === "user") {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex justify-end py-1.5"
                >
                  <div className="max-w-[85%] rounded-xl rounded-br-sm bg-indigo-600/90 px-3.5 py-2.5">
                    <p className="text-[13px] leading-relaxed text-white">
                      {msg.content}
                    </p>
                  </div>
                </motion.div>
              );
            }

            const config = TYPE_CONFIG[msg.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="py-1.5"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                      msg.type === "thinking"
                        ? "bg-violet-500/10"
                        : msg.type === "file_write"
                        ? "bg-emerald-500/10"
                        : msg.type === "error"
                        ? "bg-red-500/10"
                        : "bg-sky-500/10"
                    )}
                  >
                    <Icon className={cn("h-3 w-3", config.className)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-[13px] leading-relaxed",
                        msg.type === "thinking"
                          ? "text-white/50 italic"
                          : msg.type === "error"
                          ? "text-red-300/80"
                          : "text-white/70"
                      )}
                    >
                      {msg.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {status === "running" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-1 py-2"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-white/20" />
            <span className="text-xs text-white/25">Agent is working...</span>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-white/[0.06] px-4 py-3"
      >
        <div className="flex items-end gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 focus-within:border-white/[0.15] transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={
              status === "running"
                ? "Agent is working..."
                : "Ask the agent to change something..."
            }
            disabled={status === "running"}
            rows={1}
            className="flex-1 resize-none bg-transparent text-[13px] text-white/80 placeholder:text-white/20 focus:outline-none disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!input.trim() || status === "running"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-white/40 transition-colors hover:bg-white/[0.15] hover:text-white/70 disabled:opacity-30 disabled:hover:bg-white/[0.08]"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
