/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css"
import "vuetify/styles"

// Composables
import { createVuetify } from "vuetify"

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides

const customTheme = {
    dark: true,
    colors: {
        primary: "#4b7399",
        secondary: "#eae9d2",
        success: "#779954",
        red: "#FF5c4E",
    },
}
export default createVuetify({
    theme: {
        defaultTheme: "customTheme",
        themes: {
            customTheme,
        },
    },
    defaults: {
        VBtn: {
            color: "primary",
        },
    },
    display: {
        mobileBreakpoint: 768,
    },
})
