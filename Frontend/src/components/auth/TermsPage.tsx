import { motion } from 'framer-motion';

interface TermsPageProps {
  onBack: () => void;
}

export function TermsPage({ onBack }: TermsPageProps) {
  return (
    <div className="auth-container">
      <div className="auth-left" style={{ background: 'linear-gradient(135deg, #0062AD, #003f7f)' }}>
        <div className="auth-left-content">
          <h1>Terms & Conditions</h1>
          <p>Please read our terms carefully before using PrimeOak Solutions.</p>
        </div>
      </div>
      <div className="auth-right">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="auth-title">Terms and Conditions</h2>
          <p className="auth-subtitle">Last updated: July 2026</p>
          <div style={{ maxHeight: 360, overflowY: 'auto', marginBottom: 20, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
            <p><strong>1. Acceptance of Terms</strong></p>
            <p>By accessing and using PrimeOak Solutions, you agree to be bound by these Terms and Conditions.</p>
            <p><strong>2. User Responsibilities</strong></p>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
            <p><strong>3. Data Privacy</strong></p>
            <p>We collect and process personal data in accordance with applicable privacy laws. Your data is used solely for HR management purposes.</p>
            <p><strong>4. Acceptable Use</strong></p>
            <p>You agree not to misuse the platform, including attempting unauthorized access, distributing malware, or violating any laws.</p>
            <p><strong>5. Limitation of Liability</strong></p>
            <p>PrimeOak Solutions is provided "as is" without warranties of any kind. We are not liable for damages arising from its use.</p>
          </div>
          <button onClick={onBack} className="btn-primary">Back to Sign Up</button>
        </motion.div>
      </div>
    </div>
  );
}
