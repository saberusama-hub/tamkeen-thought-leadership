import createMDX from '@next/mdx';
import remarkFrontmatter from 'remark-frontmatter';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  async redirects() {
    return [
      // The category taxonomy was removed. Anything still pointing at
      // /category/<x> goes to the homepage with a permanent redirect.
      {
        source: '/category/:slug*',
        destination: '/',
        // Use legacy 301 (rather than Next's default 308) per spec.
        statusCode: 301,
      },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [[remarkFrontmatter, ['yaml']]],
  },
});

export default withMDX(nextConfig);
