import React from 'react';
import Header from '../components/home/Header';
import HeroSection from '../components/home/HeroSection';
import SearchSection from '../components/home/SearchSection';
import FeaturedBooks from '../components/home/FeaturedBooks';
import Footer from '../components/common/Footer';

const HomePage: React.FC = () => {
  const handleSearch = (query: string, category?: string) => {
    console.log('Search:', query, 'Category:', category);
    // Implement search functionality
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Header onSearch={handleSearch} />
      <main>
        <HeroSection />
        <SearchSection onSearch={handleSearch} />
        <FeaturedBooks />
        {/* Add more sections here */}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
