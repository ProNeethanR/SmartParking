import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000'
    }
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
