import {defineConfig} from 'cypress'

export default defineConfig({
    retries: 2,
    e2e: {
        baseUrl: 'http://localhost:3000',
    },
    projectId: "nqct2i"
})
