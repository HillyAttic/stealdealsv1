import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import Hero from '../components/Hero';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  }
}));

describe('Hero Component - Content Positioning and Animations', () => {
  beforeEach(() => {
    render(<Hero />);
  });

  test('ensures all text content is properly centered', () => {
    // Check main container has centering classes
    const heroContainer = screen.getByText('Welcome to').closest('.text-center');
    expect(heroContainer).toBeInTheDocument();
    expect(heroContainer).toHaveClass('text-center');

    // Check max-width container for centering
    const maxWidthContainer = screen.getByText('Welcome to').closest('.max-w-4xl');
    expect(maxWidthContainer).toBeInTheDocument();
    expect(maxWidthContainer).toHaveClass('mx-auto');

    // Check tagline has proper centering
    const tagline = screen.getByText(/Lease with Confidence/);
    const taglineContainer = tagline.closest('.max-w-3xl');
    expect(taglineContainer).toHaveClass('mx-auto');
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
    expect(primaryButton.closest('a')).toHaveAttribute('href', '/vacant');
    expect(primaryButton).toHaveClass('bg-secondary');
    expect(primaryButton).toHaveClass('hover:bg-secondary/90');
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
    expect(buttonContainer).toHaveClass('flex-col');
    expect(buttonContainer).toHaveClass('sm:flex-row');
    expect(buttonContainer).toHaveClass('gap-6');
    expect(buttonContainer).toHaveClass('justify-center');
  });

  test('verifies hero section background and overlay structure', () => {
    // Check background overlay opacity
    const heroSection = screen.getByText('Welcome to').closest('.bg-white\\/20');
    expect(heroSection).toBeInTheDocument();
    expect(heroSection).toHaveClass('backdrop-blur-md');
    expect(heroSection).toHaveClass('border-white/30');
  });
});