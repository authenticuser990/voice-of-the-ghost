const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

export default function Privacy({ onBack }) {
  return (
    <div className="legal-page">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Settings</button>
        <h2>Privacy Policy</h2>
      </header>

      <div className="legal-content">
        <h3>Privacy Policy</h3>
        <p>Last updated: July 2026</p>

        <h4>Information We Collect</h4>
        <p>When you create an account, we collect:</p>
        <ul>
          <li>Username, email address, and password (stored as an encrypted hash)</li>
          <li>Date of birth (used for age-based content restrictions, never shared publicly without your consent)</li>
          <li>Profile information you choose to add (display name, bio, location, interests, profile image)</li>
          <li>Content you create (posts, comments, reactions, messages, uploaded files)</li>
          <li>Community memberships and follows</li>
        </ul>

        <h4>How We Use Your Information</h4>
        <ul>
          <li>To provide and operate the Platform</li>
          <li>To enforce age restrictions and content policies</li>
          <li>To moderate content and ensure community safety</li>
          <li>To notify you of interactions (replies, follows, community updates)</li>
          <li>To comply with legal obligations</li>
        </ul>
        <p>We do NOT sell your personal data to third parties.</p>

        <h4>Anonymous Posts</h4>
        <p>
          Posts marked as anonymous hide your username from public view. However, anonymous posts remain
          linked to your account internally for moderation and legal purposes. If required by law, we may
          disclose the identity behind anonymous posts to authorized authorities.
        </p>

        <h4>Data Storage and Security</h4>
        <p>
          Your data is stored on secure servers. Passwords are hashed using bcrypt. We implement
          industry-standard security measures, but no system is 100% secure. You are responsible for
          keeping your password confidential.
        </p>

        <h4>Data Retention</h4>
        <p>
          We retain your data for as long as your account is active. If you delete your account, your
          profile data is permanently deleted. Posts and comments may be anonymized (author replaced
          with "[deleted]") but retained to preserve community context. Messages may be retained for
          both parties unless both accounts are deleted.
        </p>

        <h4>Your Rights</h4>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate data</li>
          <li>Delete your account and associated data</li>
          <li>Export your data</li>
          <li>Object to processing of your data</li>
        </ul>
        <p>You can delete your account at any time via Settings &gt; Delete Account.</p>

        <h4>Third-Party Services</h4>
        <p>
          We do not use third-party analytics, advertising, or tracking services. The Platform uses
          no cookies beyond those strictly necessary for authentication (JWT tokens stored in localStorage).
        </p>

        <h4>Children's Privacy</h4>
        <p>
          The Platform is not directed at children under 13. We do not knowingly collect data from
          children under 13. If we become aware that a user under 13 has provided personal data,
          we will delete the account and data promptly.
        </p>

        <h4>Changes to This Policy</h4>
        <p>
          We may update this privacy policy. Significant changes will be notified to users.
        </p>

        <h4>Contact</h4>
        <p>
          For privacy-related questions or requests, please contact the Platform administrators.
        </p>
      </div>
    </div>
  )
}
