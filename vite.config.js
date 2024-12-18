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
    'process.env': {},
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
        }),
        {
          name: 'remove-dev-code',
          transform(code, id) {
            if (id.includes('.vue') || id.includes('.js') || id.includes('.ts')) {
              // Remove code between DEV_ONLY_CODE_START and DEV_ONLY_CODE_END tags
              // This handles both JS-style comments and HTML comments
              return {
                code: code
                  // Remove HTML comments with development code
                  .replace(/<!--\s*DEV_ONLY_CODE_START\s*-->[\s\S]*?<!--\s*DEV_ONLY_CODE_END\s*-->/g, '')
                  // Remove JS comments with development code
                  .replace(/\/\*\s*DEV_ONLY_CODE_START\s*\*\/[\s\S]*?\/\*\s*DEV_ONLY_CODE_END\s*\*\//g, ''),
                map: null
              };
            }
          }
        }       
      ]
    }
  }
})
