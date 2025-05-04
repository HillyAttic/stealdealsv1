# Stealdeals - Real Estate Website

Stealdeals is a modern real estate platform built with Next.js and Tailwind CSS. It allows users to browse property listings, search for properties, and contact agents.

## Features

- Responsive design that works on all devices
- Property search functionality
- Featured property listings
- Modern UI with smooth animations
- Mobile-friendly navigation

## Screenshots

![Stealdeals Homepage](public/screenshot.png)

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for server-side rendering
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Icons](https://react-icons.github.io/react-icons/) - Popular icons for React applications

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/stealdeals.git
cd stealdeals
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
stealdeals/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Home page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   └── components/
│       ├── Header.tsx        # Navigation header
│       ├── Hero.tsx          # Hero section with search
│       ├── FeaturedProperties.tsx # Property listings
│       ├── WhyChooseUs.tsx   # Features section
│       └── Footer.tsx        # Footer component
├── public/                   # Static assets
└── package.json              # Project dependencies
```

## Customization

- Update the property listings in `src/components/FeaturedProperties.tsx`
- Modify the color scheme in `src/app/globals.css`
- Add additional pages in the `src/app` directory

## Deployment

This project can be easily deployed to Vercel:

```bash
npm run build
# or
yarn build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Images from [Unsplash](https://unsplash.com/)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
