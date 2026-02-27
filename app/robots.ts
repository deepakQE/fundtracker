export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://fundtracker-laal.vercel.app/sitemap.xml",
  }
}