// Define all critical images that should be preloaded
export const criticalImages = {
  logo: {
    src: "/images/file.png",
    width: 150,
    height: 50,
    quality: 100,
    loading: "eager" as const,
  },
  aiStar: {
    src: "/images/AI-Star-2.png",
    width: 250,
    height: 250,
    quality: 100,
    loading: "eager" as const,
  },
  pricingLogo: {
    src: "/images/Unbenannt-6.png",
    width: 125,
    height: 125,
    quality: 100,
    loading: "eager" as const,
  },
} as const
