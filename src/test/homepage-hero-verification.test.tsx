import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {  } from '@jest/globals';
const vi = jest;;

// Mock Next.js components
jest.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  }
}));

jest.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    return <img src={src} alt={alt} {...props} />;
  }
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: jest.fn(() => null)
  })
}));

// Import the page component
import Home from '../app/page';

describe('Homepage Hero Section - Content Positioning and Animations', () => {
  beforeEach(() => {
    render(<Home />);
  });

  test('ensures all text content is properly centered', () => {
    // Check main container has centering classes
    const heroContainer = screen.getByText('Welcome to').closest('.text-center');
    expect(heroContainer).toBeInTheDocument();
    expect(heroContainer).toHaveClass('text-center');

    // Check max-width container for centering
    const maxWidthContainer = screen.getByText('Welcome to').closest('.max-w-2xl');
    expect(maxWidthContainer).toBeInTheDocument();
    expect(maxWidthContainer).toHaveClass('mx-auto');
  });

  test('verifies slideUp animation classes are present', () => {
    // Check Welcome text has slideUp animation
    const welcomeText = screen.getByText('Welcome to');
    expect(welcomeText).toHaveClass('animate-slideUp');

    // Check main heading has slideUp animation
    const mainHeading = screen.getByText('STEAL DEALS');
    expect(mainHeading).toHaveClass('animate-slideUp');

    // Check tagline has slideUp animation
    const tagline = screen.getByText(/Lease with Confidence/);
    expect(tagline).toHaveClass('animate-slideUp');

    // Check button container has slideUp animation
    const buttonContainer = screen.getByText('View all listings').closest('.animate-slideUp');
    expect(buttonContainer).toBeInTheDocument();
  });

  test('verifies animation delays are preserved', () => {
    // Check main heading has 0.2s delay
    const mainHeading = screen.getByText('STEAL DEALS');
    expect(mainHeading).toHaveStyle('animation-delay: 0.2s');

    // Check tagline has 0.4s delay
    const tagline = screen.getByText(/Lease with Confidence/);
    expect(tagline).toHaveStyle('animation-delay: 0.4s');

    // Check button container has 0.6s delay
    const buttonContainer = screen.getByText('View all listings').closest('.animate-slideUp');
    expect(buttonContainer).toHaveStyle('animation-delay: 0.6s');
  });

  test('confirms call-to-action buttons maintain functionality and styling', () => {
    // Check primary CTA button
    const primaryButton = screen.getByText('View all listings');
    expect(primaryButton).toBeInTheDocument();
    expect(primaryButton.closest('a')).toHaveAttribute('href', '/inventory');
    expect(primaryButton).toHaveClass('bg-blue-900');
    expect(primaryButton).toHaveClass('hover:bg-blue-800');
    expect(primaryButton).toHaveClass('text-white');

    // Check secondary CTA button
    const secondaryButton = screen.getByText('Contact Us');
    expect(secondaryButton).toBeInTheDocument();
    expect(secondaryButton.closest('a')).toHaveAttribute('href', '/contact');
    expect(secondaryButton).toHaveClass('bg-transparent');
    expect(secondaryButton).toHaveClass('border-2');
    expect(secondaryButton).toHaveClass('border-white');

    // Check button container layout
    const buttonContainer = primaryButton.closest('.flex');
    expect(buttonContainer).toHaveClass('gap-4');
    expect(buttonContainer).toHaveClass('justify-center');
  });

  test('verifies enhanced hero section background opacity', () => {
    // Check background overlay has enhanced opacity (bg-white/15)
    const heroSection = screen.getByText('Welcome to').closest('.bg-white\\/15');
    expect(heroSection).toBeInTheDocument();
    expect(heroSection).toHaveClass('backdrop-blur-sm');
    expect(heroSection).toHaveClass('border-white/20');
    
    // Check enhanced padding (p-12 md:p-16)
    expect(heroSection).toHaveClass('p-12');
    expect(heroSection).toHaveClass('md:p-16');
  });

  test('verifies hero section maintains responsive behavior', () => {
    // Check responsive text sizing
    const mainHeading = screen.getByText('STEAL DEALS');
    expect(mainHeading).toHaveClass('text-5xl');
    expect(mainHeading).toHaveClass('md:text-7xl');

    // Check responsive tagline sizing
    const tagline = screen.getByText(/Lease with Confidence/);
    expect(tagline).toHaveClass('text-xl');
    expect(tagline).toHaveClass('md:text-2xl');

    // Check responsive welcome text
    const welcomeText = screen.getByText('Welcome to');
    expect(welcomeText).toHaveClass('text-lg');
  });
});