/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google profile photos
      { protocol: 'https', hostname: 'picsum.photos' },             // Featured post cover
      { protocol: 'https', hostname: 'images.unsplash.com' },       // Any Unsplash usage
      { protocol: 'https', hostname: 'i.pravatar.cc' },             // Avatars in lists
    ],
  },
};

module.exports = nextConfig;
