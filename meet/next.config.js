module.exports = async (phase, { defaultConfig }) => {
  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    compress: true,
    env: {},
    typescript: {
      tsconfigPath: "./tsconfig.next.json",
    },
    poweredByHeader: false,
    webpack: (config) => {
      const { getHashDigest } = require("loader-utils"),
        { relative } = require("path");

      config.module.rules
        .find((rule) => typeof rule.oneOf === "object")
        .oneOf.filter((rule) => Array.isArray(rule.use))
        .forEach((rule) => {
          rule.use.forEach((moduleLoader) => {
            if (
              moduleLoader.loader?.includes("css-loader") &&
              !moduleLoader.loader?.includes("postcss-loader")
            )
              moduleLoader.options.modules.getLocalIdent = (
                context,
                _,
                exportName
              ) =>
                getHashDigest(
                  Buffer.from(
                    `filePath:${relative(
                      context.rootContext,
                      context.resourcePath
                    ).replace(/\\+/g, "/")}#className:${exportName}`
                  ),
                  "md4",
                  "base64",
                  6
                )
                  .replace(/_/, "")
                  .replace(/^(-?\d|--|)/, `${exportName}-$1`);
          });
        });

      return config;
    },
  };
  return nextConfig;
};
