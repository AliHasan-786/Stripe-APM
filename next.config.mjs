

const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'stripe-radar-copilot.vercel.app'],
    },
  },
};

export default nextConfig;
