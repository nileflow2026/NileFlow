import React from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SeoHead from "../components/SeoHead";

const NotFoundPage = () => {
  const location = useLocation();

  return (
    <>
      <SeoHead
        title="Page Not Found | Nile Flow Africa"
        description="The page you are looking for does not exist. Browse our African marketplace for authentic products."
        noindex={true}
        canonicalPath="/"
      />
      <Header />
      <main
        className="min-h-screen flex flex-col items-center justify-center px-4 py-20"
        style={{
          background: "var(--nf-bg-primary)",
          color: "var(--nf-text-primary)",
        }}
      >
        <div className="text-center max-w-lg">
          {/* 404 visual */}
          <div className="mb-8">
            <span
              className="text-[7rem] leading-none font-bold select-none"
              style={{ color: "var(--nf-text-muted)" }}
              aria-hidden="true"
            >
              404
            </span>
          </div>

          <h1 className="text-2xl font-semibold mb-3">Page not found</h1>
          <p className="mb-2" style={{ color: "var(--nf-text-secondary)" }}>
            The page{" "}
            <span className="font-mono text-sm break-all">
              {location.pathname}
            </span>{" "}
            doesn't exist or has been moved.
          </p>
          <p className="mb-8" style={{ color: "var(--nf-text-secondary)" }}>
            Let's get you back to shopping authentic African products.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-3 rounded-lg font-medium bg-amber-500 hover:bg-amber-400 text-white transition-colors"
            >
              Go to Home
            </Link>
            <Link
              to="/shop"
              className="px-6 py-3 rounded-lg font-medium border transition-colors"
              style={{
                borderColor: "var(--nf-border)",
                color: "var(--nf-text-primary)",
              }}
            >
              Browse Shop
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFoundPage;
