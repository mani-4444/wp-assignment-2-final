import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  base: "/wp-assignment-2-final/",
  plugins: [vue()],
});
