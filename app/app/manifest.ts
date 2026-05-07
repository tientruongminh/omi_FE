import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Omilearn - AI học tập cá nhân hóa',
    short_name: 'Omilearn',
    description: 'Nền tảng AI học tập giúp tạo lộ trình, hỏi đáp tài liệu, ôn tập, flashcard và ghi chú thông minh.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F0EB',
    theme_color: '#6B2D3E',
    lang: 'vi',
    icons: [
      { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
    ],
  };
}
