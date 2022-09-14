import {defineConfig} from "cypress";

export default defineConfig({
    retries: 4,
    env: {
        ZENFLOWS_URL: "http://65.109.11.42:9000/api",
    },
    e2e: {
        baseUrl: "http://localhost:3000",
        setupNodeEvents(on, config) {
            require("cypress-localstorage-commands/plugin")(on, config);
            require("cypress-fail-fast/plugin")(on, config);
            return config;
        },
    },
    projectId: "nqct2i",
    component: {
        devServer: {
            framework: "next",
            bundler: "webpack",
        },
    },
});
