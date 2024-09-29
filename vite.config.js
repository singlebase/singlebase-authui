import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({customElement: true}),
  ],
  define: {
    'process.env': {}
  },
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: "./src/main.ts",
      name: 'singlebase-authui',
      // the proper extensions will be added
      fileName: 'singlebase-authui',
    },
    // rollupOptions: {
    //   // make sure to externalize deps that shouldn't be bundled
    //   // into your library
    //   external: ['vue'],
    //   output: {
    //     // Provide global variables to use in the UMD build
    //     // for externalized deps
    //     globals: {
    //       vue: 'Vue',
    //     },
    //   },
    // },
  },
})
