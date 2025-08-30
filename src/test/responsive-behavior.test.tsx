/**
 * Responsive Behavior Test Suite
 * Tests header structure, hero section enhancements, mobile menu functionality, 
 * and sticky header behavior across different screen sizes
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import {  } from '@jest/globals';
const vi = jest;;
import Header from '../components/Header';
import Hero from '../components/Hero';
import Home from '../app/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => ({
    get: () => null
  })
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>
}));

// Helper function to simulate different viewport sizes
const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
};

describe('Responsive Behavior Tests', () => {
  beforeEach(() => {
    // Reset viewport to desktop size before each test
    setViewport(1024, 768);
  });

  describe('Header Structure Tests', () => {
    test('header maintains proper structure on mobile viewport (375px)', () => {
      setViewport(375, 667);
      render(<Header />);
      
      // Verify header is present and sticky
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('sticky', 'top-0', 'z-[1000]');
      
      // Verify logo is visible
      const logo = screen.getByAltText('Stealdeals Logo');
      expect(logo).toBeInTheDocument();
      
      // Verify mobile menu button is visible
      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
      expect(mobileMenuButton).toBeInTheDocument();
      expect(mobileMenuButton).toHaveClass('md:hidden');
      
      // Verify desktop navigation is hidden on mobile
      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toHaveClass('hidden', 'md:block');
    });

    test('header maintains proper structure on tablet viewport (768px)', () => {
      setViewport(768, 1024);
      render(<Header />);
      
      // Verify header structure
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('sticky', 'top-0');
      
      // Verify logo is present
      const logo = screen.getByAltText('Stealdeals Logo');
      expect(logo).toBeInTheDocument();
      
      // At 768px, should show desktop navigation (md breakpoint)
      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toBeInTheDocument();
    });

    test('header maintains proper structure on desktop viewport (1024px+)', () => {
      setViewport(1200, 800);
      render(<Header />);
      
      // Verify header structure
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('sticky', 'top-0', 'z-[1000]', 'premium-header');
      
      // Verify all desktop elements are visible
      const logo = screen.getByAltText('Stealdeals Logo');
      expect(logo).toBeInTheDocument();
      
      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toBeInTheDocument();
      expect(desktopNav).toHaveClass('hidden', 'md:block');
      
      // Verify mobile menu button is hidden
      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
      expect(mobileMenuButton).toHaveClass('md:hidden');
      
      // Verify auth section is visible
      const authSection = screen.getByText('Sign In').closest('div');
      expect(authSection).toHaveClass('hidden', 'md:flex');
    });

    test('header class names are properly organized and readable', () => {
      render(<Header />);
      
      const header = screen.getByRole('banner');
      
      // Verify header has organized class structure
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
      expect(header).toHaveClass('z-[1000]');
      expect(header).toHaveClass('premium-header');
      expect(header).toHaveClass('w-full');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('border-gray-100');
      
      // Verify container structure
      const container = header.querySelector('.container');
      expect(container).toHaveClass('mx-auto', 'px-6', 'w-full');
      
      // Verify flex layout
      const flexContainer = container?.querySelector('.flex');
      expect(flexContainer).toHaveClass('flex', 'items-center', 'py-3');
    });
  });

  describe('Hero Section Enhancement Tests', () => {
    test('hero section displays enhanced sizing on mobile (375px)', () => {
      setViewport(375, 667);
      render(<Hero />);
      
      // Verify hero section is present
      const heroSection = screen.getByText('Welcome to').closest('div');
      expect(heroSection).toBeInTheDocument();
      
      // Verify enhanced background overlay (bg-white/20 with backdrop-blur-md)
      const heroContent = screen.getByText('STEAL DEALS').closest('.bg-white\\/20');
      expect(heroContent).toBeInTheDocument();
      expect(heroContent).toHaveClass('backdrop-blur-md');
      
      // Verify enhanced padding (p-12 md:p-16)
      expect(heroContent).toHaveClass('p-12', 'md:p-16');
      
      // Verify border and shadow enhancements
      expect(heroContent).toHaveClass('border', 'border-white/30', 'shadow-2xl');
    });

    test('hero section displays enhanced sizing on tablet (768px)', () => {
      setViewport(768, 1024);
      render(<Hero />);
      
      // Verify hero content structure
      const heroContent = screen.getByText('STEAL DEALS').closest('.bg-white\\/20');
      expect(heroContent).toBeInTheDocument();
      
      // Verify responsive padding applies correctly at tablet size
      expect(heroContent).toHaveClass('p-12', 'md:p-16');
      
      // Verify backdrop blur and opacity
      expect(heroContent).toHaveClass('backdrop-blur-md');
      expect(heroContent).toHaveClass('bg-white/20');
    });

    test('hero section displays enhanced sizing on desktop (1024px+)', () => {
      setViewport(1200, 800);
      render(<Hero />);
      
      // Verify hero content with enhanced styling
      const heroContent = screen.getByText('STEAL DEALS').closest('.bg-white\\/20');
      expect(heroContent).toBeInTheDocument();
      
      // Verify all enhanced classes are present
      expect(heroContent).toHaveClass(
        'bg-white/20',
        'backdrop-blur-md',
        'p-12',
        'md:p-16',
        'rounded-2xl',
        'border',
        'border-white/30',
        'shadow-2xl'
      );
      
      // Verify hover effects are present
      expect(heroContent).toHaveClass('hover:shadow-3xl', 'hover:bg-white/25');
    });

    test('hero section background opacity provides better readability', () => {
      render(<Hero />);
      
      // Verify enhanced background opacity
      const heroContent = screen.getByText('STEAL DEALS').closest('.bg-white\\/20');
      expect(heroContent).toBeInTheDocument();
      expect(heroContent).toHaveClass('bg-white/20'); // Enhanced from bg-white/10
      
      // Verify backdrop blur for better text contrast
      expect(heroContent).toHaveClass('backdrop-blur-md');
      
      // Verify border opacity for better definition
      expect(heroContent).toHaveClass('border-white/30');
    });

    test('hero section content remains properly centered and positioned', () => {
      render(<Hero />);
      
      // Verify main container centering
      const container = screen.getByText('Welcome to').closest('.container');
      expect(container).toHaveClass('mx-auto', 'px-4', 'py-20');
      
      // Verify content centering
      const contentWrapper = screen.getByText('Welcome to').closest('.max-w-4xl');
      expect(contentWrapper).toHaveClass('max-w-4xl', 'mx-auto', 'text-center');
      
      // Verify welcome text
      const welcomeText = screen.getByText('Welcome to');
      expect(welcomeText).toHaveClass('text-white', 'text-xl', 'mb-6');
      
      // Verify main heading
      const mainHeading = screen.getByText('STEAL DEALS');
      expect(mainHeading).toBeInTheDocument();
      
      // Verify call-to-action buttons are present
      const viewListingsButton = screen.getByText('View all listings');
      const contactButton = screen.getByText('Contact Us');
      expect(viewListingsButton).toBeInTheDocument();
      expect(contactButton).toBeInTheDocument();
    });
  });

  describe('Mobile Menu Functionality Tests', () => {
    test('mobile menu opens and closes correctly on mobile viewport', async () => {
      setViewport(375, 667);
      render(<Header />);
      
      // Verify mobile menu button is present
      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
      expect(mobileMenuButton).toBeInTheDocument();
      
      // Verify mobile menu is initially closed
      const mobileMenu = document.querySelector('.fixed.inset-0.z-\\[1001\\]');
      expect(mobileMenu).toHaveClass('opacity-0', 'pointer-events-none');
      
      // Open mobile menu
      fireEvent.click(mobileMenuButton);
      
      await waitFor(() => {
        expect(mobileMenu).toHaveClass('opacity-100');
        expect(mobileMenu).not.toHaveClass('pointer-events-none');
      });
      
      // Verify menu content is visible
      const homeLink = screen.getByText('HOME');
      expect(homeLink).toBeInTheDocument();
      
      // Close mobile menu by clicking the close button
      const closeButton = screen.getByLabelText('Close menu');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(mobileMenu).toHaveClass('opacity-0', 'pointer-events-none');
      });
    });

    test('mobile menu navigation items work correctly', () => {
      setViewport(375, 667);
      render(<Header />);
      
      // Open mobile menu
      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
      fireEvent.click(mobileMenuButton);
      
      // Verify all navigation items are present
      const navItems = ['HOME', 'ABOUT US', 'VACANT', 'PLOTS', 'BE A FRANCHISE', 'CONTACT'];
      navItems.forEach(item => {
        const navLink = screen.getByText(item);
        expect(navLink).toBeInTheDocument();
      });
      
      // Verify navigation items have proper styling
      const homeLink = screen.getByText('HOME').closest('a');
      expect(homeLink).toHaveClass('flex', 'items-center', 'py-2', 'px-4', 'rounded-md');
    });

    test('mobile menu backdrop closes menu when clicked', async () => {
      setViewport(375, 667);
      render(<Header />);
      
      // Open mobile menu
      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
      fireEvent.click(mobileMenuButton);
      
      // Click on backdrop
      const backdrop = document.querySelector('.fixed.inset-0.z-\\[1001\\]');
      fireEvent.click(backdrop!);
      
      await waitFor(() => {
        expect(backdrop).toHaveClass('opacity-0', 'pointer-events-none');
      });
    });
  });

  describe('Sticky Header Behavior Tests', () => {
    test('header maintains sticky positioning on scroll', () => {
      render(<Header />);
      
      const header = screen.getByRole('banner');
      
      // Verify sticky positioning classes
      expect(header).toHaveClass('sticky', 'top-0');
      expect(header).toHaveStyle({ position: 'sticky', top: '0' });
      
      // Verify z-index for proper layering
      expect(header).toHaveClass('z-[1000]');
    });

    test('header z-index is lower than mobile menu overlay', () => {
      setViewport(375, 667);
      render(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('z-[1000]');
      
      // Open mobile menu to verify overlay z-index
      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
      fireEvent.click(mobileMenuButton);
      
      const mobileMenuOverlay = document.querySelector('.fixed.inset-0.z-\\[1001\\]');
      expect(mobileMenuOverlay).toHaveClass('z-[1001]');
    });

    test('header maintains proper styling during sticky behavior', () => {
      render(<Header />);
      
      const header = screen.getByRole('banner');
      
      // Verify header maintains all styling classes
      expect(header).toHaveClass(
        'sticky',
        'top-0',
        'z-[1000]',
        'premium-header',
        'w-full',
        'border-b',
        'border-gray-100'
      );
      
      // Verify container maintains proper structure
      const container = header.querySelector('.container');
      expect(container).toHaveClass('mx-auto', 'px-6', 'w-full');
    });
  });

  describe('Cross-Device Animation and Interaction Tests', () => {
    test('hero animations work correctly across different screen sizes', () => {
      // Test on mobile
      setViewport(375, 667);
      render(<Hero />);
      
      // Verify animation classes are present
      const welcomeText = screen.getByText('Welcome to');
      expect(welcomeText).toHaveClass('animate-slideUp');
      
      const mainHeading = screen.getByText('STEAL DEALS');
      expect(mainHeading).toHaveClass('animate-slideUp');
      
      // Test on desktop
      setViewport(1200, 800);
      render(<Hero />);
      
      // Verify animations still work on desktop
      const welcomeTextDesktop = screen.getByText('Welcome to');
      expect(welcomeTextDesktop).toHaveClass('animate-slideUp');
    });

    test('button interactions work across different screen sizes', () => {
      // Test on mobile
      setViewport(375, 667);
      render(<Hero />);
      
      const viewListingsButton = screen.getByText('View all listings');
      expect(viewListingsButton).toBeInTheDocument();
      expect(viewListingsButton.closest('a')).toHaveAttribute('href', '/vacant');
      
      // Test on desktop
      setViewport(1200, 800);
      render(<Hero />);
      
      const viewListingsButtonDesktop = screen.getByText('View all listings');
      expect(viewListingsButtonDesktop).toBeInTheDocument();
      expect(viewListingsButtonDesktop.closest('a')).toHaveAttribute('href', '/vacant');
    });
  });

  describe('Integration Tests', () => {
    test('full page renders correctly on mobile with all responsive elements', () => {
      setViewport(375, 667);
      
      // Mock the ClientOnly component to render immediately
      jest.mock('../components/ClientOnly', () => ({
        default: ({ children }: { children: React.ReactNode }) => <>{children}</>
      }));
      
      render(<Home />);
      
      // Verify header is present
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      
      // Verify hero section is present
      const heroSection = screen.getByText('Welcome to');
      expect(heroSection).toBeInTheDocument();
      
      // Verify mobile menu functionality
      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
      expect(mobileMenuButton).toBeInTheDocument();
    });

    test('full page renders correctly on desktop with all responsive elements', () => {
      setViewport(1200, 800);
      
      // Mock the ClientOnly component
      jest.mock('../components/ClientOnly', () => ({
        default: ({ children }: { children: React.ReactNode }) => <>{children}</>
      }));
      
      render(<Home />);
      
      // Verify header is present with desktop navigation
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      
      // Verify hero section with enhanced styling
      const heroSection = screen.getByText('STEAL DEALS');
      expect(heroSection).toBeInTheDocument();
      
      // Verify desktop navigation is visible
      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toHaveClass('hidden', 'md:block');
    });
  });
});