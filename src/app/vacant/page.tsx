import { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClientOnly from '@/components/ClientOnly';
import VacantPropertiesClient from '@/components/vacant/VacantPropertiesClient';
import { getCachedVacantProperties, trackCachePerformance } from '@/lib/cache/server-cache';

// ISR Configuration for optimal performance
export const revalidate = 300; // Revalidate every 5 minutes
export const dynamic = 'force-static'; // Force static generation

// Metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const startTime = Date.now();
  
  try {
    const properties = await getCachedVacantProperties();
    trackCachePerformance('metadata-generation', startTime, properties.length);
    
    return {
      title: `Vacant Properties - ${properties.length} Available Properties | StealDeals`,
      description: `Discover ${properties.length} available vacant properties ready for your business or investment. Find the perfect space in prime locations.`,
      keywords: 'vacant properties, commercial real estate, business space, investment properties, rental properties',
      openGraph: {
        title: `${properties.length} Vacant Properties Available`,
        description: 'Discover available spaces ready for your business or investment',
        images: [
          {
            url: 'https://images.pexels.com/photos/1105754/pexels-photo-1105754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            width: 1260,
            height: 750,
            alt: 'Vacant Properties',
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Vacant Properties | StealDeals',
      description: 'Discover available spaces ready for your business or investment',
    };
  }
}

// Server Component with ISR
export default async function VacantPropertiesPage() {
  const startTime = Date.now();
  
  try {
    // Fetch data on the server with caching
    const properties = await getCachedVacantProperties();
    trackCachePerformance('page-generation', startTime, properties.length);
    
    console.log(`[ISR] Generated vacant properties page with ${properties.length} properties in ${Date.now() - startTime}ms`);

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
                  src="https://images.pexels.com/photos/1105754/pexels-photo-1105754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Vacant Properties"
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
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Vacant Properties</h1>
                  <p className="text-xl text-gray-200 mb-4">
                    Discover {properties.length} available spaces ready for your business or investment
                  </p>
                  <p className="text-sm text-gray-300">
                    ⚡ Data refreshed every 5 minutes • Cached for optimal performance
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Client Component for Interactivity */}
          <VacantPropertiesClient properties={properties} />
          
          <Footer />
        </ClientOnly>
      </main>
    );
    
  } catch (error) {
    console.error('[ISR] Error generating vacant properties page:', error);
    
    // Fallback UI for errors
    return (
      <main className="min-h-screen flex flex-col">
        <ClientOnly>
          <Header />
          
          <section className="py-20 bg-gray-100">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Vacant Properties</h1>
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6 max-w-md mx-auto">
                Failed to load properties. Please try again later.
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