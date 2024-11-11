import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist', // Directorio de salida
    rollupOptions: {
      input: {
        popup: 'src/popup.ts',
        background: 'src/background.ts',
        content: 'src/content.ts'
      },
      output: {
        // Configura el nombre de los archivos sin hash
        entryFileNames: '[name].js', // Sin hash en el nombre de archivo
        chunkFileNames: '[name].js', // Sin hash en el nombre de archivo
        assetFileNames: '[name].[ext]', // Para otros archivos (como imágenes)
      },
    },
  },
});