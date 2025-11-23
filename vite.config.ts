import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Handle unhandled promise rejections in development
// This is a workaround for the agents library trying to use fetch() with WebSocket URLs
if (process.env.NODE_ENV !== "production") {
  process.on("unhandledRejection", (reason, promise) => {
    // Ignore errors related to Fetch API and WebSocket URLs
    // This is a known issue with the agents library in development
    if (reason instanceof TypeError && reason.message?.includes("Fetch API cannot load: ws://")) {
      // Silently ignore this specific error as it doesn't affect functionality
      // The WebSocket connection will be established properly from the client side
      return;
    }
    // Log other unhandled rejections
    // biome-ignore lint/suspicious/noConsole: needed for development error logging
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [cloudflare(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
