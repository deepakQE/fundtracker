import type { GuidePage } from "@/types/blog"

export const guides: GuidePage[] = [
  {
    slug: "how-to-donate-safely",
    title: "How to Donate Safely",
    description: "A practical checklist to verify organizations, protect payment details, and avoid donation fraud.",
    content: [
      "Start by verifying NGO legitimacy through public annual reports, regulatory registrations, and transparent impact disclosures.",
      "Use secure donation pages with HTTPS and trusted payment providers. Never share OTPs or personal banking PINs.",
      "Review campaign details carefully: credible campaigns explain who is being helped, what funds cover, and expected timelines.",
      "Prefer campaigns with regular updates, media evidence, and a clear organization contact point.",
      "Use FundTracker trust and momentum signals to compare options before committing your donation.",
    ],
  },
  {
    slug: "best-charities-for-education",
    title: "Best Charities for Education",
    description: "How to identify high-impact education charities and choose campaigns with measurable outcomes.",
    content: [
      "High-impact education charities publish measurable outcomes such as attendance improvements, exam results, and retention rates.",
      "Look for budget clarity across infrastructure, teacher support, and student resources.",
      "Prioritize local partnerships and long-term program continuity over one-time events.",
      "Compare multiple campaigns in the same geography to assess efficiency per student impacted.",
      "FundTracker category pages help discover education campaigns with strong progress signals.",
    ],
  },
  {
    slug: "top-ngos-helping-children",
    title: "Top NGOs Helping Children",
    description: "A donor-focused guide to evaluating child-focused NGOs supporting healthcare, nutrition, and education.",
    content: [
      "Child-focused NGOs create impact in healthcare access, nutrition programs, and school continuity for vulnerable children.",
      "Evaluate both immediate aid metrics and long-term child development indicators.",
      "Check if field operations are supported by transparent governance and local accountability systems.",
      "Prefer organizations that publish project-level updates and disbursement breakdowns.",
      "Use FundTracker NGO pages to compare trust score, campaign count, and total funds tracked.",
    ],
  },
  {
    slug: "disaster-relief-donation-guide",
    title: "Disaster Relief Donation Guide",
    description: "How to donate effectively during emergencies and support reliable relief organizations.",
    content: [
      "During emergencies, speed matters, but verification matters more. Confirm the NGO has on-ground response capacity.",
      "Favor campaigns with operational detail such as location coverage, logistics partners, and relief milestones.",
      "Track fund utilization updates in the first weeks after the event.",
      "Small recurring donations can be more useful than one-time spikes for sustained recovery phases.",
      "Use FundTracker urgent and trending sections to identify active, credible relief campaigns.",
    ],
  },
]

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug) || null
}
