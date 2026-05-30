"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Moon, AlertCircle, X, Maximize2, MessageSquareText } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = { id: string; role: "user" | "assistant"; content: string };

const INITIAL_MESSAGE: Message = {
  id: "welcome-msg",
  role: "assistant",
  content: "Hello. I am Luna. Describe your symptoms and I can help find the right specialist for you.",
};

export function LunaWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Load chat history from Session Storage on mount
  useEffect(() => {
    const savedChat = sessionStorage.getItem("luna_chat_history");
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    }
  }, []);

  // 2. Save chat history to Session Storage whenever it changes
  useEffect(() => {
    // Only save if there's actual conversation beyond the initial greeting
    if (messages.length > 1) {
      sessionStorage.setItem("luna_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // 3. Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(false);

    try {
      const response = await fetch("/api/lunamatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: data.text },
      ]);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* The Chat Window (Rendered conditionally with smooth animations) */}
      {isOpen && (
        <Card className="w-[360px] h-[500px] mb-4 shadow-2xl border border-[#6FAEE7]/30 flex flex-col rounded-3xl overflow-hidden bg-white animate-in slide-in-from-bottom-10 fade-in zoom-in-95 duration-300 origin-bottom-right">
          
          {/* Header */}
          <div className="bg-[#1E3A5F] p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2 font-semibold">
              <Moon className="w-5 h-5 text-[#6FAEE7]" /> LunaMatch
            </div>
            <div className="flex items-center gap-1">
              {/* Expand to Full Page Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8 text-white hover:bg-white/20 rounded-full"
                onClick={() => router.push("/patient/lunamatch")}
                title="Expand to full screen"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              {/* Close Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8 text-white hover:bg-white/20 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#F7FAFC]/50" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 border border-[#6FAEE7]/20 shrink-0 mt-1">
                      <AvatarFallback className="bg-[#1E3A5F] text-white text-xs">
                        <Moon className="h-4 w-4 text-[#6FAEE7]" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`px-4 py-3 text-sm leading-relaxed shadow-sm max-w-[85%] ${
                    msg.role === "user" 
                      ? "bg-[#1E3A5F] text-white rounded-2xl rounded-br-none" 
                      : "bg-white border border-[#6FAEE7]/10 text-[#1E3A5F] rounded-2xl rounded-bl-none"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-p:leading-relaxed prose-strong:text-[#1E3A5F]">
                        <ReactMarkdown
                          components={{
                            a: ({ node, href, children, ...props }) => {
                              const isBookingLink = href?.includes("/patient/doctors/");
                              if (isBookingLink) {
                                return (
                                  <Link href={href!} className="block mt-2 px-3 py-2 bg-[#F7FAFC] text-[#1E3A5F] text-xs border border-[#6FAEE7]/30 rounded-lg font-bold hover:bg-[#1E3A5F] hover:text-white transition-all text-center !no-underline">
                                    {children}
                                  </Link>
                                );
                              }
                              return <a href={href} {...props} className="text-[#6FAEE7] font-semibold hover:underline">{children}</a>;
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start animate-pulse">
                  <Avatar className="h-8 w-8 border border-[#6FAEE7]/20 shrink-0">
                     <AvatarFallback className="bg-[#1E3A5F]"><Moon className="h-4 w-4 text-[#6FAEE7]" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-[#6FAEE7]/10 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 items-center shadow-sm">
                    <span className="h-1.5 w-1.5 bg-[#6FAEE7]/60 rounded-full animate-bounce"></span>
                    <span className="h-1.5 w-1.5 bg-[#6FAEE7]/60 rounded-full animate-bounce delay-150"></span>
                    <span className="h-1.5 w-1.5 bg-[#6FAEE7]/60 rounded-full animate-bounce delay-300"></span>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-500 text-xs text-center p-2 bg-red-50 rounded-lg border border-red-100">
                  <AlertCircle className="w-4 h-4 inline mr-1" /> Connection error. Try again.
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-[#6FAEE7]/10 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your symptoms..."
                className="flex-1 rounded-full bg-[#F7FAFC] border-[#6FAEE7]/20 text-sm h-10 px-4 focus-visible:ring-[#6FAEE7]/50"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 shrink-0" 
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </form>
          </div>
        </Card>
      )}

      {/* The Floating Action Button (FAB) */}
      {!isOpen && (
        <div className="relative group animate-in zoom-in duration-300">
          {/* Subtle ping animation to draw the user's eye */}
          <div className="absolute -inset-1 bg-[#6FAEE7] rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
          <Button
            onClick={() => setIsOpen(true)}
            size="icon"
            className="relative h-14 w-14 rounded-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 shadow-xl border border-white/10 transition-transform hover:scale-105"
          >
            <MessageSquareText className="w-6 h-6 text-white" />
          </Button>
        </div>
      )}

    </div>
  );
}