import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Extend proxy timeout to 30 min for large video uploads
        timeout: 30 * 60 * 1000,
        proxyTimeout: 30 * 60 * 1000,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-axios':  ['axios'],
          // Page group chunks
          'pages-admin':   [
            './src/pages/admin/Dashboard',
            './src/pages/admin/Students',
            './src/pages/admin/Instructors',
            './src/pages/admin/Courses',
            './src/pages/admin/Curriculum',
            './src/pages/admin/Exams',
            './src/pages/admin/Certificates',
            './src/pages/admin/Payments',
          ],
          'pages-student': [
            './src/pages/student/Dashboard',
            './src/pages/student/Courses',
            './src/pages/student/Lessons',
            './src/pages/student/Exams',
            './src/pages/student/Certificates',
            './src/pages/student/Progress',
          ],
          'pages-public': [
            './src/pages/public/Home',
            './src/pages/public/Courses',
            './src/pages/public/CourseDetail',
            './src/pages/public/Blog',
            './src/pages/public/BlogPost',
            './src/pages/public/Search',
          ],
        },
      },
    },
  },
});
