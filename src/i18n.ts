import { createI18n } from "vue-i18n";
import sk from "./locales/sk"
import en from "./locales/en"
import cs from "./locales/cs"

export const i18n = createI18n({
    legacy: false,
    locale: "cs", // default
    fallbackLocale: "en",
    messages: {
        sk,
        en,
        cs
    }
})