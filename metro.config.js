const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Zustand の ESM (middleware.mjs) が import.meta.env を使っていて
// Metro/Hermes の Web 向けでは未サポートのため、
// resolveRequest をカスタマイズして CJS を優先する
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // ネイティブ専用モジュールを Web では空モジュールに置換
  const nativeOnlyModules = [
    "react-native-google-mobile-ads",
    "expo-tracking-transparency",
  ];
  if (platform === "web" && nativeOnlyModules.includes(moduleName)) {
    return {
      type: "sourceFile",
      filePath: path.resolve(__dirname, "src/shims/empty.js"),
    };
  }

  // zustand/middleware の ESM が import.meta.env を使うため CJS を強制
  if (moduleName === "zustand/middleware" && platform === "web") {
    return {
      type: "sourceFile",
      filePath: path.resolve(
        __dirname,
        "node_modules/zustand/middleware.js",
      ),
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
