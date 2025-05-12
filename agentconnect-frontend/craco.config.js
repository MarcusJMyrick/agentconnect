module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
      loaderOptions: (postcssLoaderOptions) => {
        return postcssLoaderOptions;
      },
    },
  },
  webpack: {
    configure: {
      resolve: {
        fallback: {
          path: false,
        },
      },
    },
  },
} 