import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ChatScreen } from "./components/ChatScreen.tsx";

// biome-ignore lint/style/noNonNullAssertion: we know the root element exists
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChatScreen sessionID="default-session" />
  </StrictMode>,
);
