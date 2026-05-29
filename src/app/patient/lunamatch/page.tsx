"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Moon } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "luna";
  content: string;
};

export default function LunaMatchChat() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "luna",
      content: "Hello. I'm Luna. I'm here to help you find the right care. Can you describe what you're feeling today?"
    }
  ]);

  // Auto-scroll to bottom when a new message appears
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // TODO: Replace this timeout with a real fetch() to your /api/lunamatch endpoint
    setTimeout(() => {
      const lunaMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "luna",
        content: "Thank you for sharing that. Based on your symptoms, I recommend speaking with a General Physician. I found 3 available doctors who can help you feel better. Would you like to see their schedules?"
      };
      setMessages(prev => [...prev, lunaMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto h-[80vh] flex flex-col animate-in fade-in duration-500">
      
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">LunaMatch</h1>
        <p className="text-sm text-[#1E3A5F]/70">Intelligent, symptom-based doctor discovery.</p>
      </div>

      <Card className="flex-1 flex flex-col border-none shadow-md rounded-2xl overflow-hidden bg-white">
        
        {/* Chat Area */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                
                {msg.role === "luna" && (
                  <Avatar className="h-10 w-10 border border-[#6FAEE7]/20 shadow-sm">
                    <AvatarFallback className="bg-[#F7FAFC]">
                      <Moon className="h-5 w-5 text-[#6FAEE7]" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-[#1E3A5F] text-white rounded-br-none" 
                    : "bg-[#F7FAFC] border border-[#6FAEE7]/10 text-[#1E3A5F] rounded-bl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4 justify-start">
                <Avatar className="h-10 w-10 border border-[#6FAEE7]/20 shadow-sm">
                   <AvatarFallback className="bg-[#F7FAFC]"><Moon className="h-5 w-5 text-[#6FAEE7]" /></AvatarFallback>
                </Avatar>
                <div className="bg-[#F7FAFC] border border-[#6FAEE7]/10 rounded-2xl rounded-bl-none px-5 py-4 flex gap-1 items-center">
                  <span className="h-2 w-2 bg-[#6FAEE7]/60 rounded-full animate-bounce"></span>
                  <span className="h-2 w-2 bg-[#6FAEE7]/60 rounded-full animate-bounce delay-150"></span>
                  <span className="h-2 w-2 bg-[#6FAEE7]/60 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[#6FAEE7]/10">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms..."
              className="flex-1 rounded-full bg-[#F7FAFC] border-[#6FAEE7]/20 focus-visible:ring-[#6FAEE7]/50 h-12 px-6"
            />
            <Button type="submit" size="icon" className="h-12 w-12 rounded-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 shadow-sm transition-transform hover:scale-105" disabled={!input.trim() || isTyping}>
              <Send className="h-5 w-5 text-white" />
            </Button>
          </form>
        </div>
      </Card>

    </div>
  );
}