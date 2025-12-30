/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude Supabase Edge Functions from Next.js build
  webpack: (config) => {
    config.externals = config.externals || []
    config.externals.push({
      'https://deno.land/std@0.168.0/http/server.ts': 'commonjs https://deno.land/std@0.168.0/http/server.ts',
    })
    return config
  },
}

module.exports = nextConfig

