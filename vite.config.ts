import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export const devServerLocation = (() => {
  const hostname = "localhost";
  const port = 5173;
  const host = `${hostname}:${port}`;
  const path = "/effin-redux/";
  const fullUrl = `http://${host}${path}`;
  return { hostname, port, host, path, fullUrl };
})();

export default defineConfig({
  base: devServerLocation.path,
  server: {
    port: devServerLocation.port,
  },
  plugins: [tsconfigPaths(), react()],
  build: {
    outDir: "dist-app",
  },
});
