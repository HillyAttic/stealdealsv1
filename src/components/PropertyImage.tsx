import { useState, useEffect } from 'react';
import Image from 'next/image';

// Default fallback image
const DEFAULT_IMAGE = 'https://images.pexels.com/photos/260931/pexels-photo-260931.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

// List of trusted domains that work well with Next.js Image optimization
const TRUSTED_DOMAINS = [
  'firebasestorage.googleapis.com',
  'cdn.stealdeals.co.in',
  'images.pexels.com',
  'images.unsplash.com',
  'dropbox.com'
];

interface PropertyImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

/**
 * PropertyImage component for handling various image URLs, including Dropbox links
 * Provides fallback handling and image processing for different sources
 */
export default function PropertyImage({ 
  src, 
  alt, 
  className = "", 
  fill = true,
  width, 
  height 
}: PropertyImageProps) {
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_IMAGE);
  const [hasError, setHasError] = useState(false);
  // Determine if we should use unoptimized mode for external domains
  const [unoptimized, setUnoptimized] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageUrl(DEFAULT_IMAGE);
      setUnoptimized(false);
      return;
    }

    try {
      // Simple URL validation check
      const url = new URL(src);
      
      // Check if the domain is in our trusted list
      const isTrustedDomain = TRUSTED_DOMAINS.some(domain => url.hostname.includes(domain));
      setUnoptimized(!isTrustedDomain);
      
      // Process Dropbox URLs to make them work with Next.js Image
      if (src.includes('dropbox.com')) {
        // Convert Dropbox preview links to direct download links
        // Replace ?dl=0 with ?raw=1 or ?dl=1 with ?raw=1
        // Remove query parameters that might cause issues
        let processedUrl = src;
        
        // Remove the is_prewarmed=true parameter and other query params
        if (processedUrl.includes('?')) {
          // Extract the base URL without parameters
          const baseUrl = processedUrl.split('?')[0];
          processedUrl = baseUrl + '?raw=1';
        } else {
          processedUrl = processedUrl + '?raw=1';
        }
        
        setImageUrl(processedUrl);
      } else {
        setImageUrl(src);
      }
    } catch (error) {
      // If URL is invalid, use default image
      console.warn('Invalid image URL detected:', src);
      setImageUrl(DEFAULT_IMAGE);
      setHasError(true);
      setUnoptimized(false);
    }
  }, [src]);

  const handleImageError = () => {
    setHasError(true);
    setImageUrl(DEFAULT_IMAGE);
    setUnoptimized(false);
  };

  // When using width/height props, don't use fill
  if (!fill && width && height) {
    return (
      <Image
        src={hasError ? DEFAULT_IMAGE : imageUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleImageError}
        unoptimized={unoptimized}
        loading="lazy"
      />
    );
  }

  // With fill prop
  return (
    <div className="relative w-full h-full">
      <Image
        src={hasError ? DEFAULT_IMAGE : imageUrl}
        alt={alt}
        fill={true}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{ objectFit: 'contain' }}
        className={className}
        onError={handleImageError}
        unoptimized={unoptimized}
        loading="lazy"
      />
    </div>
  );
} 