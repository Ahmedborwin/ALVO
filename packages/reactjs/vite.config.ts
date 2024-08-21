import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    // Equivalent to Next.js's reactStrictMode
    "React.strictMode": true,
    // Environment variables
    "process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR": JSON.stringify(import.meta["env"].NEXT_PUBLIC_IGNORE_BUILD_ERROR),
  },
  build: {
    // Equivalent to Next.js's typescript.ignoreBuildErrors and eslint.ignoreDuringBuilds
    // Note: This is not a direct equivalent, you might need additional setup
    sourcemap: import.meta["env"].NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true" ? false : true,
  },
  resolve: {
    alias: {
      "~~": path.resolve(import.meta.url, "../src"),
    },
  },
  optimizeDeps: {
    exclude: ["pino-pretty", "lokijs", "encoding"],
  },
});
