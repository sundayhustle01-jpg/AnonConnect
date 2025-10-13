
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://casualfriday.co.in',
      lastModified: new Date(),
    },
    {
      url: 'https://casualfriday.co.in/chat-app',
      lastModified: new Date(),
    },
    {
      url: 'https://casualfriday.co.in/favorites',
      lastModified: new Date(),
    },
  ];
}
