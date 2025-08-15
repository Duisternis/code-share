import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react'
import commonjs from '@rollup/plugin-commonjs';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
    commonjs({
      include: ['node_modules/react-syntax-highlighter/**']
    })
  ],
})