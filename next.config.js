module.exports = async (phase, { defaultConfig }) => {
  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    typescript: {
      tsconfigPath: "./tsconfig.next.json",
    },
  };
  return nextConfig;
};
