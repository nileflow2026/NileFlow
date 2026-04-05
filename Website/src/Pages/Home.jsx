/* eslint-disable no-unused-vars */
import React, { useState, Suspense, lazy } from "react";
import Header from "../../components/Header";
import Categories from "../../components/Categories";
import Footer from "../../components/Footer";
import { useCustomerAuth } from "../../Context/CustomerAuthContext";
import useStructuredData from "../hooks/useStructuredData";
import { ORGANIZATION_SCHEMA } from "../constants/structuredData";

// Lazy load non-critical components
const HeroCarousel = lazy(() => import("../../components/HeroCarousel "));
const FeaturedProducts = lazy(
  () => import("../../components/FeaturedProducts"),
);
const RecommendationSection = lazy(() =>
  import("../../components/RecommendationSection").then((module) => ({
    default: module.RecommendationSection,
  })),
);
const PremiumBanner = lazy(() => import("../../components/PremiumBanner"));
const ScrollToTopButton = lazy(
  () => import("../../components/ScrollToTopButton"),
);

// Skeleton components for better perceived performance
const HeroSkeleton = () => (
  <div className="w-full h-64 md:h-96 bg-gray-800 rounded-lg animate-pulse"></div>
);

const ProductsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-gray-800 rounded-lg h-48 animate-pulse"></div>
    ))}
  </div>
);

const Home = () => {
  const { user, isAuthenticated } = useCustomerAuth();

  // Add Organization structured data to homepage
  useStructuredData(ORGANIZATION_SCHEMA, "organization-schema");

  return (
    <div className="bg-black text-gray-800 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="sr-only">
          Nile Flow Africa Marketplace - Premium African Products
        </h1>

        {/* Hero section with lazy loading */}
        <Suspense fallback={<HeroSkeleton />}>
          <HeroCarousel />
        </Suspense>

        {/* Categories load immediately for navigation */}
        <Categories />

        {/* Featured products with lazy loading */}
        <Suspense fallback={<ProductsSkeleton />}>
          <FeaturedProducts />
        </Suspense>

        {/* Lazy load recommendations based on authentication */}
        {isAuthenticated && user && (
          <div className="my-12">
            <Suspense fallback={<ProductsSkeleton />}>
              <RecommendationSection
                userId={user.id}
                title="Recommended for You"
                context="homepage"
              />
            </Suspense>
          </div>
        )}

        {!isAuthenticated && (
          <div className="my-12">
            <Suspense fallback={<ProductsSkeleton />}>
              <RecommendationSection
                userId={null}
                title="Popular Items"
                context="homepage_guest"
              />
            </Suspense>
          </div>
        )}
      </main>

      <Footer />

      {/* Lazy load scroll button */}
      <Suspense fallback={null}>
        <ScrollToTopButton />
      </Suspense>
    </div>
  );
};

export default Home;
