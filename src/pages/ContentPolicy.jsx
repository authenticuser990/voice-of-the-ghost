const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

export default function ContentPolicy({ onBack }) {
  return (
    <div className="legal-page">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Settings</button>
        <h2>Content Policy</h2>
      </header>

      <div className="legal-content">
        <h3>Content Policy</h3>
        <p>Last updated: July 2026</p>
        <p>
          This Content Policy defines what content is allowed on Voice of the Ghost, how NSFW content
          is handled, and the consequences of violations. All users must follow this policy.
        </p>

        <h4>NSFW Content Rules</h4>
        <p>NSFW (Not Safe For Work) content is allowed only under these conditions:</p>
        <ul>
          <li>Must be properly labeled using the "Uncensored (NSFW)" toggle on posts or "NSFW" content rating on communities</li>
          <li>Must include a content warning in the title or description</li>
          <li>Must not violate any of the prohibited content rules below</li>
          <li>Users under 18 are prohibited from posting, viewing, or accessing NSFW content</li>
        </ul>

        <h4>Prohibited Content — Zero Tolerance</h4>
        <p>The following content is strictly prohibited and will result in immediate removal and permanent ban:</p>
        <ul>
          <li>Any content involving minors in sexual, suggestive, or exploitative contexts</li>
          <li>Illegal content or content promoting illegal activities</li>
          <li>Content depicting or encouraging self-harm, suicide, or eating disorders</li>
          <li>Revenge porn, non-consensual intimate images, or content shared without consent</li>
          <li>Threats of violence, terrorism, or harm to others</li>
          <li>Hate speech based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics</li>
          <li>Stalking, harassment, or targeted bullying of individuals</li>
          <li>Spam, phishing, scams, or misleading content</li>
          <li>Content promoting dangerous or harmful products (drugs, weapons, etc.)</li>
        </ul>

        <h4>NSFW Mislabeling</h4>
        <p>
          Deliberately mislabeling content is a violation. This includes:
        </p>
        <ul>
          <li>Marking SFW content as NSFW to evade filters or attract attention</li>
          <li>Marking NSFW content as SFW to bypass the NSFW filter</li>
          <li>Attempting to disguise NSFW content through misleading titles or thumbnails</li>
        </ul>

        <h4>Age Restrictions</h4>
        <p>
          Users under 18 are subject to automatic restrictions enforced by the Platform:
        </p>
        <ul>
          <li>Cannot toggle NSFW content on posts (forced SFW)</li>
          <li>Cannot set communities as NSFW (forced SFW)</li>
          <li>Cannot view NSFW posts or join NSFW communities</li>
          <li>NSFW content is filtered from feeds and search results</li>
          <li>Attempting to bypass these restrictions may result in account suspension</li>
        </ul>

        <h4>Reporting Violations</h4>
        <p>
          Every post and comment has a Report button. Reports are reviewed by moderators. When reporting,
          please select the reason that best describes the violation. Serious or illegal content should
          be reported immediately. Moderators will review and take appropriate action, which may include
          content removal, warning, temporary suspension, or permanent ban.
        </p>

        <h4>Consequences of Violations</h4>
        <p>Violations are handled on a case-by-case basis. Consequences may include:</p>
        <ul>
          <li>Content removal with warning</li>
          <li>Temporary account suspension (1-30 days)</li>
          <li>Permanent account ban</li>
          <li>Reporting to relevant authorities (for illegal content)</li>
        </ul>
        <p>Repeated violations will result in escalated consequences. We maintain logs of all moderation actions for legal and safety purposes.</p>
      </div>
    </div>
  )
}
