import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import replace from '@rollup/plugin-replace';
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

const banner = `
/**
 * ==
 * Singlebase.cloud
 * A backend-as-a-service (BaaS), featuring:
 * - LLM & AI functionalities
 * - VectorDB: Vector Database for AI and LLM apps
 * - Datastore: NoSQL Document Database
 * - Authentication: For authentication
 * - Filestore: For file storage
 * - Search: For text search and vector search
 * - Images: Image service to manipulate image
 * 
 * Website: ${pkg.homepage}
 * ==
 * Pkg: ${pkg.pkgName}@${pkg.version}
 * Description: ${pkg.description}
 * Doc: ${pkg.documentationURL}
 * ==
 */
`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({customElement: true}),
  ],
  define: {
    'process.env': {}
  },
  build: {
    sourcemap: true,
    //minify: false,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: "./src/main.ts",
      name: 'singlebase-authui',
      // the proper extensions will be added
      fileName: 'index',
    },
    rollupOptions: {
      plugins: [
        terser({
          format: {
            preamble: banner
          }
        }),
        replace({
          preventAssignment: true,
          values: {
            '__VERSION__': pkg.version
          }
        })
      ]
    }
  }
})
