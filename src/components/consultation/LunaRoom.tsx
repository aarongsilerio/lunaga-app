"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// CRITICAL: Dynamically import Jitsi to prevent Next.js SSR crashes
const JitsiMeeting = dynamic(
  () => import("@jitsi/react-sdk").then((mod) => mod.JitsiMeeting),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#F7FAFC] text-[#1E3A5F]">
        <Loader2 className="w-10 h-10 animate-spin text-[#6FAEE7] mb-4" />
        <p className="font-medium animate-pulse">Initializing LunaRoom...</p>
      </div>
    )
  }
);

interface LunaRoomProps {
  roomName: string;      // The unique Appointment ID
  userName: string;      // The Patient or Doctor's name
  userEmail: string;     // The Clerk email address
  isDoctor: boolean;     // Gives the doctor moderator privileges
  returnUrl: string;     // Where to redirect after hanging up
}

export function LunaRoom({ roomName, userName, userEmail, isDoctor, returnUrl }: LunaRoomProps) {
  const router = useRouter();

  return (
    <div className="w-full h-[75vh] min-h-[600px] rounded-3xl overflow-hidden border border-[#6FAEE7]/20 shadow-2xl bg-black">
      <JitsiMeeting
        domain="meet.jit.si" // Uses Jitsi's free, high-tier public servers
        roomName={`Lunaga-Consultation-${roomName}`}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          disableModeratorIndicator: !isDoctor,
          prejoinPageEnabled: false, // Skips the extra pre-join screen for a seamless native feel
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'chat', 'raisehand',
            'videoquality', 'tileview', 'hangup', 'fullscreen'
          ],
        }}
        userInfo={{
          displayName: isDoctor ? `Dr. ${userName}` : userName,
          email: userEmail,
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }}
        onReadyToClose={() => {
          // Triggers when the user clicks the red "Hang Up" button
          router.push(returnUrl);
        }}
      />
    </div>
  );
}