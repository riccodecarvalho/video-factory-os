/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configuração para suportar pacotes nativos/server no servidor
    experimental: {
        serverComponentsExternalPackages: [
            'better-sqlite3',
            'fluent-ffmpeg',
            '@ffmpeg-installer/ffmpeg',
            '@ffprobe-installer/ffprobe',
            'adm-zip',
        ],
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Marcar pacotes nativos como externals
            config.externals = config.externals || [];
            config.externals.push({
                '@ffprobe-installer/ffprobe': 'commonjs @ffprobe-installer/ffprobe',
                '@ffmpeg-installer/ffmpeg': 'commonjs @ffmpeg-installer/ffmpeg',
                'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
            });
        }
        return config;
    },
}

module.exports = nextConfig
