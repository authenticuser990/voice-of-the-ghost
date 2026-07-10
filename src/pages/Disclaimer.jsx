const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

export default function Disclaimer({ onBack }) {
  return (
    <div className="legal-page">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Settings</button>
        <h2>Disclaimer</h2>
      </header>

      <div className="legal-content">
        <h3>Disclaimer</h3>
        <p>Last updated: July 2026</p>

        <h4>Not Medical Advice</h4>
        <p>
          Voice of the Ghost is a peer support platform. It is NOT a healthcare service, mental health
          provider, or medical facility. The content shared on this platform, including posts,
          comments, and community discussions, represents the personal views and experiences of individual
          users, not professional medical advice.
        </p>
        <p>
          <strong>We do not diagnose, treat, cure, or prevent any medical or mental health condition.</strong>
          You should not rely on information from this platform as a substitute for professional
          medical advice, diagnosis, or treatment.
        </p>

        <h4>If You Are in Crisis</h4>
        <p>
          If you are experiencing a mental health crisis, suicidal thoughts, or need immediate help:
        </p>
        <ul>
          <li><strong>Emergency Services:</strong> Call your local emergency number (e.g., 911 in the US)</li>
          <li><strong>988 Suicide & Crisis Lifeline (US):</strong> Call or text 988</li>
          <li><strong>Crisis Text Line:</strong> Text HOME to 741741 (US) or your local crisis text line</li>
          <li><strong>International Association for Suicide Prevention:</strong> Visit <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noopener noreferrer">iasp.info</a> for crisis centers worldwide</li>
          <li><strong>Samaritans (UK):</strong> Call 116 123</li>
        </ul>
        <p>
          These resources are available 24/7 and are staffed by trained professionals and volunteers.
          Please reach out if you need help.
        </p>

        <h4>No Professional Relationship</h4>
        <p>
          Using Voice of the Ghost does not create a therapist-patient, doctor-patient, or any other
          professional relationship between you and the platform operators, moderators, or other users.
          Peer support is valuable but it is not a replacement for professional care.
        </p>

        <h4>User-Generated Content</h4>
        <p>
          The views expressed on this platform are those of individual users and do not reflect the
          views of Voice of the Ghost, its operators, or affiliates. We do not endorse, verify, or
          guarantee the accuracy of any user-generated content.
        </p>

        <h4>No Liability</h4>
        <p>
          To the fullest extent permitted by law, Voice of the Ghost, its operators, moderators, and
          affiliates disclaim all liability for any harm, injury, or damages resulting from your use
          of the platform, your reliance on content shared by other users, or your interactions with
          other users. You use the platform at your own risk.
        </p>

        <h4>Emergency Warning</h4>
        <p>
          <strong>Do NOT use this platform in an emergency.</strong> If you or someone you know is in
          immediate danger, call emergency services right away. Do not wait for a response on this platform.
        </p>
      </div>
    </div>
  )
}
