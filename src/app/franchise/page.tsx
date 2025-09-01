import { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ClientOnly from '../../components/ClientOnly';
import Image from 'next/image';
import FranchisePageClient from '@/components/franchise/FranchisePageClient';
import { getCachedFranchises, trackCachePerformance } from '@/lib/cache/server-cache';

// ISR Configuration for optimal performance
export const revalidate = 600; // Revalidate every 10 minutes (franchises change less frequently)
export const dynamic = 'force-static'; // Force static generation

// Metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const startTime = Date.now();
  
  try {
    const franchises = await getCachedFranchises();
    trackCachePerformance('franchise-metadata-generation', startTime, franchises.length);
    
    return {
      title: `Franchise Opportunities - ${franchises.length} Available Franchises | StealDeals`,
      description: `Explore ${franchises.length} franchise opportunities across India. Start your business with top brands and become a successful entrepreneur.`,
      keywords: 'franchise opportunities, business franchise, franchise investment, brand partnership, entrepreneur, franchise business',
      openGraph: {
        title: `${franchises.length} Franchise Opportunities Available`,
        description: 'Start your business with India\'s top brands and become a successful entrepreneur',
        images: [
          {
            url: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            width: 1260,
            height: 750,
            alt: 'Franchise Opportunities',
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error generating franchise metadata:', error);
    return {
      title: 'Franchise Opportunities | StealDeals',
      description: 'Start your business with India\'s top brands and become a successful entrepreneur',
    };
  }
}

// Server Component with ISR
export default async function FranchisePage() {
  const startTime = Date.now();
  
  try {
    // Fetch data on the server with caching
    const franchises = await getCachedFranchises();
    trackCachePerformance('franchise-page-generation', startTime, franchises.length);
    
    console.log(`[ISR] Generated franchise page with ${franchises.length} franchises in ${Date.now() - startTime}ms`);

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
                  src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Franchise Opportunities"
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
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Be a Franchise Partner</h1>
                  <p className="text-xl text-gray-200 mb-4">
                    Start your business with {franchises.length} top brands and become a successful entrepreneur
                  </p>
                  <p className="text-sm text-gray-300 mb-8">
                    ⚡ Data refreshed every 10 minutes • Cached for optimal performance
                  </p>
                  <div className="flex flex-col sm:flex-row justify-start gap-4 max-w-md">
                    <Link 
                      href="#browse-franchises" 
                      className="bg-white text-primary hover:bg-gray-50 py-3 px-6 rounded-md font-semibold transition-colors text-center"
                    >
                      Browse Franchises
                    </Link>
                    <Link 
                      href="#contact-form" 
                      className="bg-primary border-2 border-white text-white hover:bg-secondary py-3 px-6 rounded-md font-semibold transition-colors text-center"
                    >
                      List Your Brand
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Client Component for Interactivity */}
          <FranchisePageClient franchises={franchises} />
          
          <Footer />
        </ClientOnly>
      </main>
    );
    
  } catch (error) {
    console.error('[ISR] Error generating franchise page:', error);
    
    // Fallback UI for errors
    return (
      <main className="min-h-screen flex flex-col">
        <ClientOnly>
          <Header />
          
          <section className="py-20 bg-gray-100">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Franchise Opportunities</h1>
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6 max-w-md mx-auto">
                Failed to load franchise opportunities. Please try again later.
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-secondary transition-colors"
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
