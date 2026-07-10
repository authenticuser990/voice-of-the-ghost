const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

export default function Terms({ onBack }) {
  return (
    <div className="legal-page">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Settings</button>
        <h2>Terms of Service</h2>
      </header>

      <div className="legal-content">
        <h3>Terms of Service</h3>
        <p>Last updated: July 2026</p>

        <h4>1. Acceptance of Terms</h4>
        <p>
          By accessing or using Voice of the Ghost ("the Platform"), you agree to be bound by these Terms of Service.
          If you do not agree, do not use the Platform. Continued use after any updates constitutes acceptance
          of the revised terms.
        </p>

        <h4>2. Eligibility</h4>
        <p>
          You must be at least 13 years old to use the Platform. Users under 18 are subject to additional
          restrictions on NSFW content as described in the Content Policy. By registering, you represent
          that all information you provide (including your date of birth) is accurate and truthful.
        </p>

        <h4>3. User Responsibilities</h4>
        <p>You are solely responsible for all content you post, including text, images, videos, audio, and documents. You agree that you will not:</p>
        <ul>
          <li>Post illegal content or content that violates any applicable law</li>
          <li>Post content depicting or promoting violence, self-harm, or suicide (crisis resources are available instead)</li>
          <li>Post content involving minors in sexual or exploitative contexts — zero tolerance, immediate ban and report to authorities</li>
          <li>Harass, bully, threaten, or stalk any user</li>
          <li>Impersonate another person or entity</li>
          <li>Mislabel content — SFW content as NSFW or vice versa — to circumvent filters or age restrictions</li>
          <li>Attempt to bypass age verification or NSFW restrictions</li>
          <li>Use the Platform for any commercial solicitation, spam, or advertising</li>
          <li>Share personal contact information of yourself or others without consent</li>
          <li>Attempt to access, modify, or delete another user's data</li>
        </ul>

        <h4>4. NSFW Content</h4>
        <p>
          NSFW (Not Safe For Work) content is permitted only when properly labeled using the Platform's
          built-in tools. Users under 18 are prohibited from posting, viewing, or accessing NSFW content.
          NSFW content includes but is not limited to: explicit language, sexual themes, graphic violence,
          and adult discussions. Users who mislabel content or attempt to bypass NSFW restrictions will
          have their content removed and may be banned.
        </p>

        <h4>5. Content Moderation</h4>
        <p>
          We reserve the right, but not the obligation, to review, moderate, and remove any content that
          violates these terms or our Content Policy. We may suspend or permanently ban accounts that
          repeatedly violate these terms. Moderation decisions are final. We log all moderation actions
          (removals, bans) with timestamps for legal compliance.
        </p>

        <h4>6. Reporting Violations</h4>
        <p>
          If you encounter content that violates these terms, use the Report feature available on every
          post and comment. Reports are reviewed by our moderation team. You may also contact us directly
          for serious violations involving illegal content or threats to safety.
        </p>

        <h4>7. Intellectual Property</h4>
        <p>
          You retain ownership of content you post. By posting, you grant the Platform a non-exclusive,
          royalty-free license to display, distribute, and moderate your content on the Platform.
          You represent that you own or have the necessary rights to all content you share.
        </p>

        <h4>8. Disclaimer of Medical Advice</h4>
        <p>
          Voice of the Ghost is a peer support platform, NOT a medical or healthcare service. We do not
          provide diagnosis, treatment, or professional mental health care. If you are in crisis, contact
          emergency services or a crisis helpline immediately. Never disregard professional medical advice
          based on content you encounter on this Platform.
        </p>

        <h4>9. Limitation of Liability</h4>
        <p>
          To the maximum extent permitted by law, Voice of the Ghost, its operators, and affiliates are not
          liable for any damages arising from your use of the Platform, including but not limited to direct,
          indirect, incidental, punitive, and consequential damages. The Platform is provided "as is"
          without warranties of any kind.
        </p>

        <h4>10. Termination</h4>
        <p>
          We reserve the right to suspend or terminate accounts at our discretion, with or without notice,
          for violations of these terms. You may delete your account at any time via Settings.
        </p>

        <h4>11. Governing Law</h4>
        <p>
          These terms are governed by applicable laws. By using the Platform, you consent to the jurisdiction
          of the courts in the governing jurisdiction for any disputes.
        </p>

        <h4>12. Changes to Terms</h4>
        <p>
          We may update these terms. Significant changes will be notified to users. Continued use after
          changes take effect constitutes acceptance.
        </p>

        <h4>13. Contact</h4>
        <p>
          For questions about these terms or to report violations, please contact the Platform administrators.
        </p>
      </div>
    </div>
  )
}
