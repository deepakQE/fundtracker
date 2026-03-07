export function getWelcomeEmailTemplate(email: string) {
  return {
    subject: "Welcome to FundTracker Weekly Donation Insights",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h1 style="color: #047857;">Welcome to FundTracker</h1>
        <p>Hi ${email},</p>
        <p>Thanks for subscribing to FundTracker updates. Every week, we share trending campaigns, trusted NGOs, and practical donation guides.</p>
        <p>What you can expect:</p>
        <ul>
          <li>Top campaigns by funding momentum</li>
          <li>NGO trust and transparency highlights</li>
          <li>Safe donation best practices</li>
        </ul>
        <p>Start exploring: <a href="https://fundtracker.me" target="_blank" rel="noopener noreferrer">FundTracker</a></p>
        <p>With gratitude,<br/>FundTracker Team</p>
      </div>
    `.trim(),
  }
}
