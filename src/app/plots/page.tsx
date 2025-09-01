import { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClientOnly from '@/components/ClientOnly';
import PlotsPageClient from '@/components/plots/PlotsPageClient';
import { getCachedPlots, trackCachePerformance } from '@/lib/cache/server-cache';

// ISR Configuration for optimal performance
export const revalidate = 600; // Revalidate every 10 minutes (plots change less frequently)
export const dynamic = 'force-static'; // Force static generation

// Metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const startTime = Date.now();
  
  try {
    const plots = await getCachedPlots();
    trackCachePerformance('plots-metadata-generation', startTime, plots.length);
    
    return {
      title: `Plot Projects - ${plots.length} Available Plots | StealDeals`,
      description: `Discover ${plots.length} premium plot projects for your investment and development needs. Find the perfect plot in prime locations.`,
      keywords: 'plot projects, land investment, real estate plots, property development, land for sale',
      openGraph: {
        title: `${plots.length} Plot Projects Available`,
        description: 'Discover premium plot projects for your investment and development needs',
        images: [
          {
            url: 'https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            width: 1260,
            height: 750,
            alt: 'Plot Projects',
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error generating plots metadata:', error);
    return {
      title: 'Plot Projects | StealDeals',
      description: 'Discover premium plot projects for your investment and development needs',
    };
  }
}

// Server Component with ISR
export default async function PlotsPage() {
  const startTime = Date.now();
  
  try {
    // Fetch data on the server with caching
    const plots = await getCachedPlots();
    trackCachePerformance('plots-page-generation', startTime, plots.length);
    
    console.log(`[ISR] Generated plots page with ${plots.length} plots in ${Date.now() - startTime}ms`);

    return (
      <main className="min-h-screen flex flex-col">
        <ClientOnly>
          <Header />
          
          {/* Hero Section */}
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-blue-900/50 z-10"></div>
            <div className="absolute inset-0">
              <div className="w-full h-full">
                <Image 
                  src="https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Plot Projects"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                  quality={90}
                  className="brightness-75"
                />
              </div>
            </div>
            
            <div className="relative z-20 py-24 md:py-32">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Plot Projects</h1>
                  <p className="text-xl text-gray-200 mb-4">
                    Discover {plots.length} premium plot projects for your investment and development needs
                  </p>
                  <p className="text-sm text-gray-300">
                    ⚡ Data refreshed every 10 minutes • Cached for optimal performance
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Client Component for Interactivity */}
          <PlotsPageClient plots={plots} />
          
          <Footer />
        </ClientOnly>
      </main>
    );
    
  } catch (error) {
    console.error('[ISR] Error generating plots page:', error);
    
    // Fallback UI for errors
    return (
      <main className="min-h-screen flex flex-col">
        <ClientOnly>
          <Header />
          
          <section className="py-20 bg-gray-100">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Plot Projects</h1>
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6 max-w-md mx-auto">
                Failed to load plot projects. Please try again later.
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </section>
          
          <Footer />
        </ClientOnly>
      </main>
    );
  }
}