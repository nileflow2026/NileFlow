import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api";

import {
  Sparkles,
  Loader2,
  Star,
  ChevronRight,
  Zap,
  Leaf,
  Gem,
  Coffee,
  Shirt,
  Home,
  Smartphone,
  Heart,
  Award,
} from "lucide-react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categoryIcons = {
    fashion: <Shirt className="w-full h-full" />,
    electronics: <Smartphone className="w-full h-full" />,
    home: <Home className="w-full h-full" />,
    beauty: <Heart className="w-full h-full" />,
    food: <Coffee className="w-full h-full" />,
    art: <Gem className="w-full h-full" />,
    premium: <Award className="w-full h-full" />,
    deals: <Zap className="w-full h-full" />,
  };

  const categoryGradients = [
    "from-amber-500/20 via-orange-500/20 to-yellow-500/20",
    "from-emerald-500/20 via-green-500/20 to-teal-500/20",
    "from-red-500/20 via-rose-500/20 to-pink-500/20",
    "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
    "from-violet-500/20 via-purple-500/20 to-fuchsia-500/20",
    "from-cyan-500/20 via-blue-500/20 to-sky-500/20",
    "from-amber-500/20 via-yellow-500/20 to-lime-500/20",
    "from-rose-500/20 via-pink-500/20 to-red-500/20",
  ];

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(
          "/api/customerprofile/categories",
        );
        setCategories(response.data);
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes("fashion") || name.includes("clothing"))
      return categoryIcons.fashion;
    if (name.includes("electronic") || name.includes("tech"))
      return categoryIcons.electronics;
    if (name.includes("home") || name.includes("decor"))
      return categoryIcons.home;
    if (name.includes("beauty") || name.includes("cosmetic"))
      return categoryIcons.beauty;
    if (name.includes("food") || name.includes("drink"))
      return categoryIcons.food;
    if (name.includes("art") || name.includes("craft"))
      return categoryIcons.art;
    if (name.includes("premium") || name.includes("luxury"))
      return categoryIcons.premium;
    if (name.includes("deal") || name.includes("sale"))
      return categoryIcons.deals;
    return <Star className="w-full h-full" />;
  };

  return (
    <section className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 px-2 xs:px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 via-transparent to-emerald-900/5"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-emerald-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-500/5 to-amber-500/10 rounded-full blur-3xl translate-y-48 -translate-x-48"></div>

      <div className="relative max-w-8xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <div className="inline-flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-amber-900/20 to-emerald-900/20 backdrop-blur-sm px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-[var(--nf-border-subtle)] mb-3 sm:mb-4">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-400" />
            <span className="text-[color:var(--nf-accent)] font-medium tracking-wide text-xs sm:text-sm md:text-base">
              Premium Collections
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-300 via-emerald-200 to-yellow-200 bg-clip-text text-transparent">
              African Excellence
            </span>
            <br />
            <span className="text-[color:var(--nf-text-primary)] mt-2 block">
              Curated Categories
            </span>
          </h2>

          <p className="text-[color:var(--nf-text-secondary)] max-w-2xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl">
            Discover authentic products from across Africa, handpicked for
            quality and cultural significance
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl h-40 animate-pulse"
                style={{ background: "var(--nf-bg-subtle)" }}
              />
            ))}
          </div>
        )}

        {/* Categories Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {categories.map((cat, index) => {
              const categoryId = cat.id || cat.$id;
              const gradientClass =
                categoryGradients[index % categoryGradients.length];
              return (
                <Link
                  to={`/categories/${encodeURIComponent(String(categoryId))}`}
                  key={categoryId}
                  className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-2"
                  onMouseEnter={() => setHoveredCategory(categoryId)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {/* Background Glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  ></div>

                  {/* Card */}
                  <div className="relative bg-[var(--nf-card-bg)] backdrop-blur-sm border border-[var(--nf-border-subtle)] rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 h-full transition-all duration-500 group-hover:border-amber-500/50 group-hover:shadow-2xl group-hover:shadow-amber-900/30">
                    {/* Icon & Badge */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4 md:mb-6">
                      <div
                        className={`p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradientClass.replace(
                          "/20",
                          "/30",
                        )} border border-amber-700/20 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <div className="text-[color:var(--nf-accent)]">
                          <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8">
                            {getCategoryIcon(cat.name)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 bg-gradient-to-r from-amber-900/40 to-yellow-900/30 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[var(--nf-border-subtle)]">
                        <Star className="w-2 h-2 sm:w-3 sm:h-3 text-amber-400" />
                        <span className="text-xs font-bold text-[color:var(--nf-accent)]">
                          Premium
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-[color:var(--nf-text-primary)] group-hover:text-[color:var(--nf-accent)] transition-colors duration-300">
                        {cat.name}
                      </h3>

                      <p className="text-[color:var(--nf-text-muted)] text-xs sm:text-sm md:text-base line-clamp-2 group-hover:text-[color:var(--nf-text-secondary)] transition-colors duration-300">
                        {cat.description ||
                          `Discover premium ${cat.name.toLowerCase()} from across Africa`}
                      </p>
                    </div>

                    {/* Image Container */}
                    <div className="mt-3 sm:mt-4 md:mt-6 relative h-32 sm:h-36 md:h-40 rounded-xl sm:rounded-2xl overflow-hidden bg-[var(--nf-bg-subtle)] border border-amber-800/20 group-hover:border-amber-500/30 transition-all duration-500">
                      <img
                        src={cat.img || "/placeholder.png"}
                        alt={`${cat.name} category image`}
                        title={`${cat.name} products`}
                        className={`w-full h-full object-cover transition-transform duration-700 ${
                          hoveredCategory === categoryId
                            ? "scale-110"
                            : "scale-100"
                        }`}
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

                      {/* Featured Tag */}
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        Featured
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 sm:mt-4 md:mt-6 flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <div className="flex -space-x-1 sm:-space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border border-[var(--nf-border)] sm:border-2 bg-gradient-to-br from-amber-500 to-yellow-600"
                            ></div>
                          ))}
                        </div>
                        <span className="text-xs text-[color:var(--nf-text-muted)] ml-1 sm:ml-2">
                          500+ products
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 sm:space-x-2 text-amber-400 group-hover:text-[color:var(--nf-accent)] transition-colors duration-300">
                        <span className="text-xs sm:text-sm font-semibold">
                          Explore
                        </span>
                        <ChevronRight
                          className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${
                            hoveredCategory === categoryId
                              ? "translate-x-1"
                              : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Hover Effect Line */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-emerald-500 group-hover:w-3/4 transition-all duration-500 rounded-full"></div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        {!loading && categories.length > 0 && (
          <div className="text-center mt-8 sm:mt-10 md:mt-12">
            <Link
              to="/shop"
              className="group inline-flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-900/30 to-emerald-900/30 backdrop-blur-sm border border-amber-700/40 rounded-xl sm:rounded-2xl hover:border-amber-500/60 transition-all duration-300"
            >
              <span className="text-sm sm:text-base md:text-lg font-bold text-[color:var(--nf-accent)] group-hover:text-[color:var(--nf-text-primary)] transition-colors duration-300">
                Explore All Products
              </span>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-400 group-hover:text-[color:var(--nf-accent)] group-hover:translate-x-1 transition-all duration-300 relative" />
              </div>
            </Link>
          </div>
        )}

        {/* No Categories State */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-900/30 to-emerald-900/30 border border-[var(--nf-border-subtle)] mb-4 sm:mb-6">
              <Gem className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-amber-400" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[color:var(--nf-text-primary)] mb-2 sm:mb-3">
              No Categories Found
            </h3>
            <p className="text-[color:var(--nf-text-muted)] max-w-md mx-auto text-sm sm:text-base">
              We're currently curating premium African products for you. Check
              back soon for our exclusive collections.
            </p>
          </div>
        )}

        {/* Stats Bar */}
        <div className="mt-8 sm:mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-amber-900/20 to-transparent backdrop-blur-sm border border-[var(--nf-border-subtle)] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[color:var(--nf-accent)] mb-1 sm:mb-2">
              500+
            </div>
            <div className="text-[color:var(--nf-text-muted)] text-xs sm:text-sm">
              Premium Products
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/20 to-transparent backdrop-blur-sm border border-emerald-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-300 mb-1 sm:mb-2">
              50+
            </div>
            <div className="text-emerald-100/80 text-xs sm:text-sm">
              African Regions
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-900/20 to-transparent backdrop-blur-sm border border-red-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-300 mb-1 sm:mb-2">
              100%
            </div>
            <div className="text-red-100/80 text-xs sm:text-sm">
              Authentic Quality
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/20 to-transparent backdrop-blur-sm border border-blue-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-300 mb-1 sm:mb-2">
              24/7
            </div>
            <div className="text-blue-100/80 text-xs sm:text-sm">
              Support Available
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
