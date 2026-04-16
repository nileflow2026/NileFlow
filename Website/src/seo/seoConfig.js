const SITE_NAME = "Nile Flow Africa";
const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://nileflowafrica.com"
).replace(/\/$/, "");
const DEFAULT_OG_IMAGE = `${SITE_URL}/new1.png`;

const DEFAULT_SEO = {
  title: "Nile Flow Africa | Premium African E-commerce",
  description:
    "Discover authentic African products, fashion, crafts, and cultural treasures on Nile Flow Africa.",
  type: "website",
  canonicalPath: "/",
  noindex: false,
};

const ROUTE_SEO = [
  {
    pattern: "/",
    title: "Nile Flow Africa | Premium African E-commerce",
    description:
      "Shop premium African products, discover artisan stories, and experience authentic commerce from across Africa.",
    canonicalPath: "/",
    type: "website",
  },
  {
    pattern: "/shop",
    title: "Shop Authentic African Products | Nile Flow Africa",
    description:
      "Browse curated African products, crafts, fashion, and premium collections from trusted vendors.",
    canonicalPath: "/shop",
  },
  {
    pattern: "/deals",
    title: "Best Deals on African Products | Nile Flow Africa",
    description:
      "Explore limited-time deals and exclusive offers on authentic African products.",
    canonicalPath: "/deals",
  },
  {
    pattern: "/categories",
    title: "Product Categories | Nile Flow Africa",
    description:
      "Explore categories of African products, from handmade crafts to fashion and cultural essentials.",
    canonicalPath: "/categories",
  },
  {
    pattern: "/categories/:categoryId",
    title: "Category Products | Nile Flow Africa",
    description:
      "Browse products in this category and discover quality African items from verified sellers.",
    canonicalPath: null,
  },
  {
    pattern: "/products/:id",
    title: "Product Details | Nile Flow Africa",
    description:
      "View product details, pricing, reviews, and shipping info for this Nile Flow Africa listing.",
    canonicalPath: null,
    type: "product",
  },
  {
    pattern: "/search",
    title: "Search African Products | Nile Flow Africa",
    description:
      "Search and discover curated African products tailored to your interests.",
    canonicalPath: "/search",
    noindex: true,
  },
  {
    pattern: "/about-us",
    title: "About Nile Flow Africa",
    description:
      "Learn about Nile Flow Africa, our mission, and our commitment to authentic African commerce.",
    canonicalPath: "/about-us",
  },
  {
    pattern: "/contact",
    title: "Contact Nile Flow Africa",
    description:
      "Contact Nile Flow Africa support for help with products, orders, and marketplace inquiries.",
    canonicalPath: "/contact",
  },
  {
    pattern: "/help-center",
    title: "Help Center | Nile Flow Africa",
    description:
      "Find answers to frequently asked questions about orders, returns, payments, and account support.",
    canonicalPath: "/help-center",
  },
  {
    pattern: "/return-policy",
    title: "Return Policy | Nile Flow Africa",
    description:
      "Read Nile Flow Africa's return and refund policy for marketplace purchases.",
    canonicalPath: "/return-policy",
  },
  {
    pattern: "/terms",
    title: "Terms of Service | Nile Flow Africa",
    description:
      "Review Nile Flow Africa terms and conditions for using our marketplace platform.",
    canonicalPath: "/terms",
  },
  {
    pattern: "/privacy",
    title: "Privacy Policy | Nile Flow Africa",
    description:
      "Understand how Nile Flow Africa collects, processes, and protects your personal data.",
    canonicalPath: "/privacy",
  },
  {
    pattern: "/discover",
    title: "Discover Africa | Nile Flow Africa",
    description:
      "Explore African culture, stories, and curated discoveries alongside authentic marketplace products.",
    canonicalPath: "/discover",
  },
  {
    pattern: "/african-chronicles",
    title: "African Chronicles | Nile Flow Africa",
    description:
      "Read inspiring African stories, heritage content, and community-driven chronicles.",
    canonicalPath: "/african-chronicles",
  },
  {
    pattern: "/premium-deals",
    title: "Premium Deals | Nile Flow Africa",
    description:
      "Unlock premium marketplace deals and special pricing for selected African products.",
    canonicalPath: "/premium-deals",
  },
  {
    pattern: "/featured-products",
    title: "Featured Products | Nile Flow Africa",
    description:
      "Shop trending and featured products selected by Nile Flow Africa.",
    canonicalPath: "/featured-products",
  },
  {
    pattern: "/careers",
    title: "Careers | Nile Flow Africa",
    description:
      "Join Nile Flow Africa and help shape the future of African e-commerce.",
    canonicalPath: "/careers",
  },
  {
    pattern: "/signin",
    title: "Sign In | Nile Flow Africa",
    description: "Access your Nile Flow Africa account.",
    canonicalPath: "/signin",
    noindex: true,
  },
  {
    pattern: "/signup",
    title: "Create Account | Nile Flow Africa",
    description: "Create your Nile Flow Africa account to start shopping.",
    canonicalPath: "/signup",
    noindex: true,
  },
  {
    pattern: "/forgot-password",
    title: "Forgot Password | Nile Flow Africa",
    description: "Reset your Nile Flow Africa account password.",
    canonicalPath: "/forgot-password",
    noindex: true,
  },
  {
    pattern: "/reset-password",
    title: "Reset Password | Nile Flow Africa",
    description: "Set a new password for your Nile Flow Africa account.",
    canonicalPath: "/reset-password",
    noindex: true,
  },
  {
    pattern: "/cart",
    title: "Your Cart | Nile Flow Africa",
    description: "Review items in your cart before checkout.",
    canonicalPath: "/cart",
    noindex: true,
  },
  {
    pattern: "/checkout",
    title: "Checkout | Nile Flow Africa",
    description: "Complete your secure checkout on Nile Flow Africa.",
    canonicalPath: "/checkout",
    noindex: true,
  },
  {
    pattern: "/profile",
    title: "My Profile | Nile Flow Africa",
    description: "Manage your Nile Flow Africa account profile.",
    canonicalPath: "/profile",
    noindex: true,
  },
  {
    pattern: "/orders",
    title: "My Orders | Nile Flow Africa",
    description: "View and manage your Nile Flow Africa orders.",
    canonicalPath: "/orders",
    noindex: true,
  },
  {
    pattern: "/addresses",
    title: "My Addresses | Nile Flow Africa",
    description: "Manage your saved delivery addresses.",
    canonicalPath: "/addresses",
    noindex: true,
  },
  {
    pattern: "/settings",
    title: "Account Settings | Nile Flow Africa",
    description: "Manage your Nile Flow Africa account settings.",
    canonicalPath: "/settings",
    noindex: true,
  },
  {
    pattern: "/notification",
    title: "Notifications | Nile Flow Africa",
    description: "View your Nile Flow Africa notifications.",
    canonicalPath: "/notification",
    noindex: true,
  },
  {
    pattern: "/redeem",
    title: "Redeem Points | Nile Flow Africa",
    description: "Redeem your loyalty points on Nile Flow Africa.",
    canonicalPath: "/redeem",
    noindex: true,
  },
  {
    pattern: "/currency",
    title: "Currency Settings | Nile Flow Africa",
    description: "Set your preferred currency for shopping.",
    canonicalPath: "/currency",
    noindex: true,
  },
  {
    pattern: "/cancel-order",
    title: "Cancel Order | Nile Flow Africa",
    description: "Cancel your Nile Flow Africa order.",
    canonicalPath: "/cancel-order",
    noindex: true,
  },
  {
    pattern: "/track-order",
    title: "Track Order | Nile Flow Africa",
    description: "Track the status of your Nile Flow Africa order.",
    canonicalPath: "/track-order",
    noindex: true,
  },
  {
    pattern: "/track-order/:id",
    title: "Order Tracking | Nile Flow Africa",
    description: "Track the live status of your order.",
    canonicalPath: null,
    noindex: true,
  },
  {
    pattern: "/payment",
    title: "Payment | Nile Flow Africa",
    description: "Complete your payment on Nile Flow Africa.",
    canonicalPath: "/payment",
    noindex: true,
  },
  {
    pattern: "/payment-success",
    title: "Payment Successful | Nile Flow Africa",
    description: "Your payment was successful.",
    canonicalPath: "/payment-success",
    noindex: true,
  },
  {
    pattern: "/payment-cancelled",
    title: "Payment Cancelled | Nile Flow Africa",
    description: "Your payment was cancelled.",
    canonicalPath: "/payment-cancelled",
    noindex: true,
  },
  {
    pattern: "/subscription/success",
    title: "Subscription Confirmed | Nile Flow Africa",
    description: "Your premium subscription is now active.",
    canonicalPath: "/subscription/success",
    noindex: true,
  },
  {
    pattern: "/group/:id",
    title: "Group Buy | Nile Flow Africa",
    description: "Join a group buy and save on authentic African products.",
    canonicalPath: null,
    noindex: true,
  },
  {
    pattern: "/apply/:jobId",
    title: "Job Application | Nile Flow Africa",
    description: "Apply for a position at Nile Flow Africa.",
    canonicalPath: null,
    noindex: true,
  },
  {
    pattern: "/language",
    title: "Language Settings | Nile Flow Africa",
    description: "Choose your preferred language.",
    canonicalPath: "/language",
    noindex: true,
  },
];

const buildAbsoluteUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
};

const humanizePath = (pathname) => {
  if (!pathname || pathname === "/") {
    return DEFAULT_SEO.title;
  }

  const cleaned = pathname.replace(/^\//, "").replace(/[-_]/g, " ").trim();
  const words = cleaned
    .split("/")
    .flatMap((segment) => segment.split(" "))
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`);

  const phrase = words.join(" ");
  return `${phrase} | ${SITE_NAME}`;
};

export {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_SEO,
  ROUTE_SEO,
  buildAbsoluteUrl,
  humanizePath,
};
