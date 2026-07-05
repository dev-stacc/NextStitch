import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // pdfkit loads AFM font files from its own package directory at runtime.
  // Excluding it from the server bundle lets Node resolve those files normally.
  serverExternalPackages: ['pdfkit'],
}

export default nextConfig
