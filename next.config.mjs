/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  images: {
    domains: ["pbmvrjvjhablmelovyoc.supabase.co"],
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
