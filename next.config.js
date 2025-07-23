const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gestionale.sudimport.website',
        port: '',
        pathname: '/files/**',
      },
    ],
  },
};

module.exports = nextConfig;
