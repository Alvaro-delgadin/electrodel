/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbmvrjvjhablmelovyoc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  compiler: {
    emotion: true,
  },
};

export default nextConfig;
