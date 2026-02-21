"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface QuickOption {
  label: string;
  value: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [quickOptions, setQuickOptions] = useState<QuickOption[]>([]);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract quick reply options from bot message
  const extractQuickOptions = (message: string): QuickOption[] => {
    const options: QuickOption[] = [];

    // Safety check
    if (!message || typeof message !== "string") {
      return options;
    }

    const lowerMessage = message.toLowerCase();

    // Look for common question patterns and suggest answers
    if (lowerMessage.includes("what") && lowerMessage.includes("product")) {
      options.push(
        { label: "Web App", value: "I want to build a web application" },
        { label: "Mobile App", value: "I want to build a mobile app" },
        { label: "SaaS Tool", value: "I want to build a SaaS tool" }
      );
    } else if (lowerMessage.includes("platform")) {
      options.push(
        { label: "Web", value: "Web platform" },
        { label: "iOS & Android", value: "Mobile - iOS and Android" },
        { label: "Desktop", value: "Desktop application" }
      );
    } else if (lowerMessage.includes("monetization") || lowerMessage.includes("charge")) {
      options.push(
        { label: "Free", value: "It will be free" },
        { label: "Freemium", value: "Freemium model with paid tiers" },
        { label: "Subscription", value: "Paid subscription" },
        { label: "One-time", value: "One-time purchase" }
      );
    } else if (lowerMessage.includes("design") || lowerMessage.includes("style")) {
      options.push(
        { label: "Modern & Minimal", value: "Modern and minimalist design" },
        { label: "Bold & Colorful", value: "Bold and colorful" },
        { label: "Professional", value: "Professional and corporate" },
        { label: "Playful", value: "Playful and fun" }
      );
    }

    return options;
  };

  // Generate a random project idea
  const generateProjectIdea = async () => {
    setIsGeneratingIdea(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          generateIdea: true,
        }),
      });

      const data = await response.json();

      // Send the generated idea as a user message
      setMessages([{ role: "assistant", content: data.greeting }]);

      // Auto-send the generated idea
      setTimeout(() => {
        sendMessage(null, data.idea);
      }, 500);

      setIsGeneratingIdea(false);
    } catch (error) {
      console.error("Error generating idea:", error);
      setIsGeneratingIdea(false);
    }
  };

  useEffect(() => {
    // Initial greeting from bot
    if (messages.length === 0) {
      setIsLoading(true);
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          initialGreeting: true,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          const botMessage = data.message;
          setMessages([{ role: "assistant", content: botMessage }]);
          setQuickOptions(extractQuickOptions(botMessage));
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, []);

  const sendMessage = async (e: React.FormEvent | null, quickMessage?: string) => {
    if (e) e.preventDefault();

    const userMessage = quickMessage || input.trim();
    if (!userMessage || isLoading) return;

    setInput("");
    setQuickOptions([]);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      const data = await response.json();
      const botMessage = data.message;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botMessage },
      ]);

      // Extract quick options from bot response
      setQuickOptions(extractQuickOptions(botMessage));

      // Check if spec is complete
      if (data.complete) {
        setIsComplete(true);
        setProjectPath(data.projectPath);
        setQuickOptions([]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-8">
      <div className="max-w-3xl w-full mx-auto flex flex-col flex-1">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="text-zinc-500 hover:text-white transition-colors inline-flex items-center gap-1"
            >
              ← Back to dashboard
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 text-sm rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
              >
                New Chat
              </button>
              <button
                onClick={generateProjectIdea}
                disabled={isGeneratingIdea || isLoading || messages.length > 2}
                className="px-3 py-1.5 text-sm rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGeneratingIdea ? "Generating..." : "✨ Generate Idea"}
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Requirements Chat
          </h1>
          <p className="text-zinc-500">
            Tell me about your product idea and I&apos;ll help you create a
            detailed specification
          </p>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="bg-zinc-800 text-zinc-500 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce [animation-delay:0.2s]">
                    ●
                  </span>
                  <span className="animate-bounce [animation-delay:0.4s]">
                    ●
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Complete State */}
        {isComplete && projectPath && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <h2 className="text-lg font-medium text-emerald-400 mb-2">
              ✨ Specification Complete!
            </h2>
            <p className="text-zinc-400 mb-4">
              Your product specification has been generated and saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/spec")}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
              >
                View Spec
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}

        {/* Quick Options */}
        {!isComplete && quickOptions.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-zinc-500 mb-2">Quick replies:</p>
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(null, option.value)}
                  disabled={isLoading}
                  className="px-3 py-2 text-sm rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        {!isComplete && (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
