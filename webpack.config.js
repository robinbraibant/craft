const path = require("path");
const webpack = require("webpack");

const tailwindConf = require("./tailwind.config.js");

//  Plugins
const globby = require("globby");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageminPlugin = require("imagemin-webpack-plugin").default;
const CopyPlugin = require("copy-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const PurgecssPlugin = require("purgecss-webpack-plugin");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const PATHS = {
  public: path.join(__dirname, "public"),
  templates: path.join(__dirname, "templates"),
  modules: path.join(__dirname, "modules"),
  tailoff: path.join(__dirname, "tailoff", "/js"),
  favicon: path.join(__dirname, "tailoff", "/img"),
  icons: path.join(__dirname, "tailoff", "/icons")
};

const webcomponentsjs = "./node_modules/@webcomponents/webcomponentsjs";
const polyfills = [
  {
    from: path.resolve(`${webcomponentsjs}/webcomponents-*.{js,map}`),
    to: `${PATHS.public}/js/vendor`,
    flatten: true
  },
  {
    from: path.resolve(`${webcomponentsjs}/bundles/*.{js,map}`),
    to: `${PATHS.public}/js/vendor/bundles`,
    flatten: true
  },
  {
    from: path.resolve(`${webcomponentsjs}/custom-elements-es5-adapter.js`),
    to: `${PATHS.public}/js/vendor`,
    flatten: true
  }
];

module.exports = env => {
  const isDevelopment = env.NODE_ENV === "development";

  return {
    mode: env.NODE_ENV,
    entry: {
      main: getSourcePath("js/main.js")
    },
    output: {
      path: getPublicPath(),
      filename: "js/[name].js"
    },
    module: {
      rules: [
        // {
        //   test: /\.m?js$/,
        //   exclude: /node_modules/,
        //   use: {
        //     loader: "babel-loader",
        //     options: {
        //       presets: ["@babel/env"]
        //     }
        //   }
        // },
        // {
        //   test: /\.js$/,
        //   exclude: /node_modules/,
        //   loader: "babel-loader",
        //   options: {
        //     plugins: ["@babel/plugin-syntax-dynamic-import"],
        //     presets: [
        //       [
        //         "@babel/preset-env",
        //         {
        //           useBuiltIns: "usage",
        //           targets: ">1%, not dead, not ie 11"
        //         }
        //       ]
        //     ]
        //   }
        // },
        {
          test: /\.js$/,
          exclude: /node_modules\/(?!(lit-element|lit-html))/,
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    ie: 11
                  }
                }
              ]
            ],
            plugins: [["@babel/plugin-transform-runtime"]]
          }
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {}
            },
            {
              loader: "css-loader",
              options: {
                url: false
              }
            },
            {
              loader: "postcss-loader",
              options: {
                ident: "postcss",
                plugins: [
                  require("postcss-import"),
                  require("tailwindcss"),
                  require("autoprefixer")
                ]
              }
            }
          ]
        },
        {
          test: /\.font\.js/,
          use: ["css-loader", "webfonts-loader"]
        }
      ]
    },

    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
      }),
      new MiniCssExtractPlugin({
        filename: "css/[name].css"
      }),
      new CopyPlugin(
        [
          ...polyfills,
          {
            from: getSourcePath("img"),
            to: getPublicPath("img")
          }
        ],
        {
          ignore: [".DS_Store"]
        }
      ),
      new ImageminPlugin({
        test: /\.img\.(jpe?g|png|gif)$/i
      }),
      new Dotenv(),
      ...(!isDevelopment || env.purge
        ? [
            new PurgecssPlugin({
              paths: globby.sync(
                [
                  `${PATHS.templates}/**/*`,
                  `${PATHS.modules}/**/*`,
                  `${PATHS.tailoff}/**/*`
                ],
                { nodir: true }
              ),
              extractors: [
                {
                  extractor: class {
                    static extract(content) {
                      return content.match(/[\w-/:]+(?<!:)/g) || [];
                    }
                  },
                  extensions: [
                    "html",
                    "js",
                    "php",
                    "vue",
                    "twig",
                    "scss",
                    "css",
                    "svg",
                    "md"
                  ]
                }
              ],
              whitelistPatternsChildren: [
                /pika*/,
                /modaal/,
                /selectize/,
                /selectize-*/,
                /dropdown/,
                /show/,
                /dropdown show/
              ]
            })
          ]
        : []),
      ...(isDevelopment
        ? [
            new BrowserSyncPlugin({
              host: "localhost",
              port: 3000,
              proxy: process.env.npm_package_config_proxy,
              files: ["**/*.css", "**/*.js", "**/*.twig"]
            })
          ]
        : []),
      new HtmlWebpackPlugin({
        filename: `${PATHS.templates}/_snippet/_global/_favicon.twig`,
        template: `${PATHS.public}/img/favicon.ejs`,
        inject: false,
        files: {
          css: []
        }
      }),
      new FaviconsWebpackPlugin({
        logo: `${PATHS.favicon}/favicon.svg`,
        devMode: "webapp",
        cache: true,
        favicons: {
          theme_color: tailwindConf.theme.colors.primary.default
        }
      })
    ],
    optimization: {
      minimizer: [
        new TerserJSPlugin({
          terserOptions: {
            output: {
              comments: false
            }
          }
        }),
        new OptimizeCSSAssetsPlugin()
      ]
    },

    stats: {
      children: false
    }
  };
};

function getSourcePath() {
  return path.resolve(process.env.npm_package_config_path_src, ...arguments);
}

function getPublicPath() {
  return path.resolve(process.env.npm_package_config_path_public, ...arguments);
}
