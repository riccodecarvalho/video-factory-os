/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configuração para suportar better-sqlite3 no servidor
    experimental: {
        serverComponentsExternalPackages: ['better-sqlite3'],
    },
}

module.exports = nextConfig
