"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { pusherClient } from "@/lib/pusher";
import { toast } from "sonner";
import { BellRing } from "lucide-react";

export function NotificationListener() {
  const { userId } = useAuth();

  useEffect(() => {
    if (!pusherClient || !userId) return;
    // 1. Subscribe the user to their personal secure channel
    const channelName = `user-${userId}`;
    const channel = pusherClient.subscribe(channelName);

    // 2. Listen for incoming notifications
    channel.bind("new-notification", (data: { id: string; title: string; message: string }) => {
      // Trigger the UI Toast
      toast(data.title, {
        description: data.message,
        icon: <BellRing className="w-5 h-5 text-[#6FAEE7]" />,
        position: "top-right",
        duration: 8000, // Stay on screen slightly longer for medical alerts
      });
      
      // Optional: You can also play a subtle notification sound here!
    });

    // 3. Cleanup on unmount
    return () => {
      pusherClient?.unsubscribe(channelName);
    };
  }, [userId]);

  return null; // This is a logic-only component, it renders nothing directly
}