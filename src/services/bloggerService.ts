import DOMPurify from 'dompurify';
import { 
  BloggerPost, 
  BloggerPostsResponse, 
  BloggerBlogInfo, 
  APIErrorDetail 
} from '../types/blogger';

const BASE_URL = 'https://www.googleapis.com/blogger/v3';

/**
 * Extracts a single primary thumbnail according to project requirements:
 * 1. post.images[0].url
 * 2. first <img> src in HTML content
 * 3. returns null for fallback graphic
 */
export function extractPrimaryThumbnail(post: BloggerPost): string | null {
  // Priority 1: First valid image from images[]
  if (post.images && Array.isArray(post.images) && post.images.length > 0) {
    const firstImg = post.images[0]?.url;
    if (firstImg && isValidImageUrl(firstImg)) {
      return normalizeImageUrl(firstImg);
    }
  }

  // Priority 2: First <img> tag in HTML content
  if (post.content) {
    const match = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1] && isValidImageUrl(match[1])) {
      return normalizeImageUrl(match[1]);
    }
  }

  // Priority 3: Fallback handled by UI
  return null;
}

function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('http://') || 
    trimmed.startsWith('https://') || 
    trimmed.startsWith('//')
  );
}

function normalizeImageUrl(url: string): string {
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  // Blogger often serves s72-c or w72-h72 thumbnails in some places; replace with higher resolution s1600 if applicable
  if (url.includes('googleusercontent.com') || url.includes('blogger.googleusercontent.com') || url.includes('bp.blogspot.com')) {
    return url.replace(/\/s[0-9]+(-c)?\//, '/s1600/');
  }
  return url;
}

/**
 * Sanitizes HTML using DOMPurify
 */
export function sanitizeArticleHtml(rawHtml: string): string {
  if (!rawHtml) return '';
  
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'img', 'figure', 'figcaption', 'a', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['src', 'alt', 'title', 'href', 'target', 'rel', 'class', 'width', 'height'],
    ADD_ATTR: ['target', 'rel'],
    FORCE_BODY: true
  });
}

/**
 * Extracts plain text preview snippet from HTML content
 */
export function createTextSnippet(htmlContent: string, maxLength: number = 150): string {
  if (!htmlContent) return '';
  
  // Strip tags using DOM parser or regex fallback
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = DOMPurify.sanitize(htmlContent, { ALLOWED_TAGS: [] });
  const text = (tempDiv.textContent || tempDiv.innerText || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  
  // Cut at last space before maxLength to avoid broken words
  const cut = text.substring(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.7 ? cut.substring(0, lastSpace) : cut) + '...';
}

/**
 * Calculate estimated reading time
 */
export function calculateReadingTime(htmlContent: string): number {
  if (!htmlContent) return 1;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const text = tempDiv.textContent || '';
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

/**
 * Parses response error and creates a descriptive error object
 */
async function parseErrorResponse(response: Response): Promise<APIErrorDetail> {
  const contentType = response.headers.get('content-type') || '';
  let serverMessage = '';

  if (contentType.includes('application/json')) {
    try {
      const errorJson = await response.json();
      serverMessage = errorJson?.error?.message || JSON.stringify(errorJson);
    } catch {
      serverMessage = response.statusText;
    }
  } else {
    // Received HTML error page
    const text = await response.text();
    const isHtml = text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
    if (isHtml) {
      return {
        code: response.status,
        type: 'INVALID_JSON',
        message: `Server mengembalikan halaman HTML dan bukan data JSON resmi Blogger (Status: ${response.status} ${response.statusText}).`,
        help: 'Pastikan Blog ID dan API Key valid serta endpoint tidak diblokir oleh proxy atau jaringan.'
      };
    }
    serverMessage = text.substring(0, 200);
  }

  // 400 Bad Request
  if (response.status === 400) {
    if (serverMessage.toLowerCase().includes('api key') || serverMessage.toLowerCase().includes('key invalid')) {
      return {
        code: 400,
        type: 'INVALID_KEY_OR_PERMISSION',
        message: 'API Key Google Blogger tidak valid.',
        help: 'Periksa kembali Blogger API Key Anda di Google Cloud Console. Pastikan tidak ada spasi atau karakter yang terpotong.'
      };
    }
    return {
      code: 400,
      type: 'INVALID_BLOG_ID',
      message: `Permintaan tidak valid: ${serverMessage}`,
      help: 'Periksa format Blog ID Anda. Contoh: 3619052327211751609.'
    };
  }

  // 403 Forbidden
  if (response.status === 403) {
    if (serverMessage.toLowerCase().includes('blogger api has not been used') || serverMessage.toLowerCase().includes('disabled')) {
      return {
        code: 403,
        type: 'API_NOT_ENABLED',
        message: 'Blogger API v3 belum diaktifkan di Google Cloud Project Anda.',
        help: 'Buka Google Cloud Console > "APIs & Services" > "Enable APIs and Services" > cari "Blogger API v3" dan klik "ENABLE".'
      };
    }
    if (serverMessage.toLowerCase().includes('quota') || serverMessage.toLowerCase().includes('rate limit')) {
      return {
        code: 403,
        type: 'QUOTA_EXCEEDED',
        message: 'Batas kuota harian Blogger API telah tercapai (User Rate Limit Exceeded).',
        help: 'Tunggu beberapa saat atau tingkatkan kuota di Google Cloud Console.'
      };
    }
    return {
      code: 403,
      type: 'INVALID_KEY_OR_PERMISSION',
      message: `Akses ditolak: ${serverMessage}`,
      help: 'Jika menggunakan pembatasan API Key (API Restrictions atau HTTP Referrers), pastikan mengizinkan domain aplikasi ini dan layanan Blogger API v3.'
    };
  }

  // 404 Not Found
  if (response.status === 404) {
    return {
      code: 404,
      type: 'INVALID_BLOG_ID',
      message: 'Blog Blogger tidak ditemukan (404 Not Found).',
      help: 'Pastikan Blog ID (3619052327211751609) benar dan blog tersebut berstatus publik.'
    };
  }

  return {
    code: response.status,
    type: 'UNKNOWN',
    message: serverMessage || `Terjadi kesalahan saat memanggil Blogger API (${response.status} ${response.statusText})`,
    help: 'Periksa koneksi internet dan pengaturan API di Google Cloud Console.'
  };
}

/**
 * Tests connection to Blogger Blog
 */
export async function testBloggerConnection(blogId: string, apiKey: string): Promise<BloggerBlogInfo> {
  const cleanBlogId = blogId.trim();
  const cleanKey = apiKey.trim();

  if (!cleanBlogId) {
    throw {
      type: 'INVALID_BLOG_ID',
      message: 'Blog ID tidak boleh kosong.',
      help: 'Gunakan Blog ID default SEISMO WEATHER NEWS: 3619052327211751609.'
    } as APIErrorDetail;
  }

  if (!cleanKey) {
    throw {
      type: 'MISSING_API_KEY',
      message: 'Blogger API Key belum diisi.',
      help: 'Silakan masukkan Google API Key dengan akses Blogger API v3 untuk menguji koneksi.'
    } as APIErrorDetail;
  }

  const endpoint = `${BASE_URL}/blogs/${cleanBlogId}?key=${encodeURIComponent(cleanKey)}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw await parseErrorResponse(response);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw {
        type: 'INVALID_JSON',
        message: 'Respons dari server bukan format JSON yang valid.',
        help: 'Periksa URL dan pastikan jaringan tidak mengalihkan koneksi ke halaman login / portal WiFi.'
      } as APIErrorDetail;
    }

    const data: BloggerBlogInfo = await response.json();
    return data;
  } catch (error: any) {
    if (error?.type) {
      throw error;
    }
    // Network failure (CORS, offline, DNS)
    throw {
      type: 'NETWORK_ERROR',
      message: `Gagal menghubungi server Blogger: ${error?.message || 'Network request failed'}.`,
      help: 'Pastikan perangkat terhubung ke internet dan tidak ada ekstensi pemblokir request seperti adblocker yang memblokir googleapis.com.'
    } as APIErrorDetail;
  }
}

/**
 * Fetches articles from Blogger API v3 with pagination, labels filtering, and query support
 */
export async function fetchBloggerPosts(options: {
  blogId: string;
  apiKey: string;
  maxResults?: number;
  pageToken?: string;
  labels?: string;
  searchQuery?: string;
}): Promise<BloggerPostsResponse> {
  const { blogId, apiKey, maxResults = 20, pageToken, labels, searchQuery } = options;

  const cleanBlogId = blogId.trim();
  const cleanKey = apiKey.trim();

  if (!cleanBlogId) {
    throw {
      type: 'INVALID_BLOG_ID',
      message: 'Blog ID tidak valid.',
      help: 'Gunakan Blog ID 3619052327211751609.'
    } as APIErrorDetail;
  }

  if (!cleanKey) {
    throw {
      type: 'MISSING_API_KEY',
      message: 'API Key Blogger belum diisi.',
      help: 'Masukkan API Key Anda pada panel pengaturan di sisi kanan untuk memuat berita asli dari Blogger.'
    } as APIErrorDetail;
  }

  // Build query parameters
  const params = new URLSearchParams();
  params.set('key', cleanKey);
  params.set('fetchImages', 'true');
  params.set('maxResults', String(Math.min(Math.max(1, maxResults), 50)));

  if (pageToken) {
    params.set('pageToken', pageToken);
  }

  if (labels && labels.trim() && labels.toLowerCase() !== 'semua' && labels.toLowerCase() !== 'semua berita') {
    params.set('labels', labels.trim());
  }

  if (searchQuery && searchQuery.trim()) {
    params.set('q', searchQuery.trim());
  }

  const endpoint = `${BASE_URL}/blogs/${cleanBlogId}/posts?${params.toString()}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw await parseErrorResponse(response);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw {
        type: 'INVALID_JSON',
        message: 'Respons dari server bukan format JSON yang valid.',
        help: 'Pastikan koneksi internet stabil dan permintaan tidak dialihkan.'
      } as APIErrorDetail;
    }

    const data: BloggerPostsResponse = await response.json();
    return data;
  } catch (error: any) {
    if (error?.type) {
      throw error;
    }
    throw {
      type: 'NETWORK_ERROR',
      message: `Jaringan gagal: ${error?.message || 'Failed to fetch posts'}.`,
      help: 'Periksa koneksi internet Anda atau coba muat ulang beberapa saat lagi.'
    } as APIErrorDetail;
  }
}
