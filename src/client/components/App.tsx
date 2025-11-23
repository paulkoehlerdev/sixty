import { ThemeProvider } from "next-themes";
import type React from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatScreen } from "@/client/components/ChatScreen";
import { Toaster } from "@/components/ui/sonner";

const LOCAL_STORAGE_SESSION_KEY = "sixty-session-id";

export const App: React.FC = () => {
  const [sessionID] = useState<string>(localStorage.getItem(LOCAL_STORAGE_SESSION_KEY) ?? uuidv4());

  localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, sessionID);

  const newSession = () => {
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    window.location.reload();
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <ChatScreen sessionID={sessionID} startNewSession={newSession} />
      <Toaster />
    </ThemeProvider>
  );
};
