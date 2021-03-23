const webpack = require("webpack");
const path = require("path");
module.exports = (env, argv) => {
  const mode = argv.mode;
  const isDev = mode === 'development';
  const config = {
    entry: './main.js',
    output: {
      filename: "./bundle.js",
    },
    module: {
      rules: [

        //.js 文件使用 jsx-loader 来编译处理
        {
          test: /\.js$/, exclude: /node_modules/, loader: "babel-loader",
          options: {
            plugins: [],
          },
        },
      ],
    }
  };
  return config;
}

