
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Privacy, Terms & AI Use Policy
            </h1>
            <p className="text-gray-600 text-lg">
              Last updated: June 13, 2025
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-12">
            <p className="text-gray-700 text-lg leading-relaxed">
              Welcome to Tavara Care. This page outlines our Privacy Policy, Terms of Service, Cookies, 
              and Responsible AI Use, all in one place—written with care, transparency, and your trust in mind.
            </p>
          </div>

          {/* Privacy Policy Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🛡️</span>
              Privacy Policy
            </h2>
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                We value your trust and are committed to protecting your personal information. 
                When you use Tavara Care, we may collect:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Information you provide:</strong> names, contact info, care preferences, feedback, etc.</li>
                <li><strong>Usage data:</strong> pages visited, time spent, clicks, and technical diagnostics.</li>
                <li><strong>Care data (if you're a caregiver or family member):</strong> for coordination and support only.</li>
              </ul>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-3">🔐</span>
                  How We Use Your Data
                </h3>
                <p className="text-gray-700 mb-4">We use your data to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Provide personalized care coordination features</li>
                  <li>Improve platform performance and offerings</li>
                  <li>Respond to support inquiries or feedback</li>
                  <li>Ensure safety and fraud prevention</li>
                </ul>
                <p className="text-gray-700 font-semibold mt-4">
                  We do not sell your personal data, ever.
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-3">🤝</span>
                  Data Sharing
                </h3>
                <p className="text-gray-700 mb-4">We only share your data when:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>You give us explicit consent</li>
                  <li>Required for services (e.g., matching caregivers/families)</li>
                  <li>Legally necessary (e.g., safety, compliance)</li>
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-3">🧼</span>
                  Your Rights
                </h3>
                <p className="text-gray-700 mb-4">You can request to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>View or edit your data</li>
                  <li>Delete your profile</li>
                  <li>Opt out of non-essential communications</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  Email us at <a href="mailto:TavaraCare@gmail.com" className="text-primary-600 hover:text-primary-700 underline">TavaraCare@gmail.com</a> to exercise these rights.
                </p>
              </div>
            </div>
          </section>

          {/* Terms of Service Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">📜</span>
              Terms of Service
            </h2>
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                By using Tavara Care, you agree to:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Use our platform respectfully, lawfully, and in good faith</li>
                <li>Refrain from uploading harmful, false, or abusive content</li>
                <li>Understand that any caregiving support is non-medical unless explicitly stated</li>
              </ul>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-3">💡</span>
                  Our Commitment
                </h3>
                <p className="text-gray-700">
                  We aim to maintain a safe, inclusive, and welcoming space for families, 
                  professionals, and community members alike.
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-3">📌</span>
                  Accounts
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>You're responsible for keeping your login credentials secure</li>
                  <li>You may not impersonate others or misrepresent your role</li>
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-3">⚠️</span>
                  Limitations
                </h3>
                <p className="text-gray-700">
                  Tavara Care is a support coordination tool, not a substitute for professional 
                  medical, legal, or mental health services.
                </p>
              </div>
            </div>
          </section>

          {/* Cookies Policy Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🍪</span>
              Cookies Policy
            </h2>
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                We use cookies to make your experience better. This includes:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Keeping you logged in</li>
                <li>Remembering your preferences</li>
                <li>Understanding how people use the platform</li>
              </ul>

              <p className="text-gray-700">
                You can disable cookies in your browser settings if you prefer, though some features 
                may not work properly.
              </p>

              <p className="text-gray-700">
                We do not use cookies to track you across other sites, and we never sell your behavioral data.
              </p>
            </div>
          </section>

          {/* AI Use & Transparency Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🤖</span>
              AI Use & Transparency
            </h2>
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                We believe in being clear about how AI is used on Tavara Care.
              </p>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-3">✅</span>
                  Where We Use AI
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Some imagery on our site is AI-generated for illustrative or educational purposes</li>
                  <li>Certain messages (like chatbot replies or support answers) are created with the help of AI tools</li>
                  <li>Our onboarding and care matching flows may use AI to assist, not replace, human care</li>
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-3">🙋</span>
                  Our Human Commitment
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Real humans build, review, and improve every AI-powered feature</li>
                  <li>Any recommendations made by AI are clearly marked and should be validated by users</li>
                  <li>We do not allow AI to make medical or legal decisions on your behalf</li>
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-3">🧬</span>
                  Bios, Illustrations & Content
                </h3>
                <p className="text-gray-700">
                  Some caregiver or team bios may use AI-enhanced summaries to reflect tone, clarity, 
                  and warmth—but the information is based on real humans and real experiences. Similarly, 
                  floral, family, or community imagery may include AI-enhanced visuals to reflect seasonal 
                  vibes and diversity. These are not meant to mislead but to uplift and visually support our values.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="text-center bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-center">
              <span className="mr-3">💬</span>
              Questions or Concerns?
            </h2>
            <p className="text-gray-700 mb-4">We're here to talk.</p>
            <div className="space-y-2">
              <p className="text-gray-700">
                📧 Email: <a href="mailto:TavaraCare@gmail.com" className="text-primary-600 hover:text-primary-700 underline">TavaraCare@gmail.com</a>
              </p>
              <p className="text-gray-700">📍 Port of Spain, Trinidad & Tobago</p>
            </div>
            <p className="text-gray-700 mt-6 italic">
              Thank you for trusting Tavara Care. We're here to support—not replace—the human heart of caregiving.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
