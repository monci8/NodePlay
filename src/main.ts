/* Application */
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { i18n } from "./i18n"

/* Libraries */
import ElementPlus from 'element-plus';

/* Styles */
import 'element-plus/dist/index.css';
import './assets/main.css'

const app = createApp(App);

app.use(ElementPlus);
app.use(router);
app.use(i18n);

app.mount("#app");

const originalWarn = console.warn;
console.warn = function (message, ...optionalParams) {
    if (typeof message === "string" && message.includes("Setting a `style` bypass at element creation")) {
        return;
    }
    originalWarn.apply(console, [message, ...optionalParams]);
};
