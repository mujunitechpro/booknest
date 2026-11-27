import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    base: "/booknest/",

    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                search: resolve(__dirname, "search.html"),
                details: resolve(__dirname, "details.html"),
                library: resolve(__dirname, "library.html"),
                login: resolve(__dirname, "login.html"),
                register: resolve(__dirname, "register.html")
            }
        }
    }
});