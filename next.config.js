/** @type {import('next').NextConfig} */
const {
    i18n
} = require('./next-i18next.config');
const nextConfig = {
    i18n,
    reactStrictMode: true,
    swcMinify: true,
    env: {
        GRAPHQL: "https://fcos.interfacer.dyne.org/api/",
        FILE: "https://fcos.interfacer.dyne.org/api/file",
    },
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
            process: false,
            path: false,
            crypto: false,
        };

        return config;
    },
}

module.exports = nextConfig
