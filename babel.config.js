module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Handle import.meta for web builds by replacing with empty object
      [
        "babel-plugin-transform-define",
        {
          "import.meta": {},
        },
      ],
    ].filter(Boolean),
  };
};
