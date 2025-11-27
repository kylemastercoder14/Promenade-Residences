/* eslint-disable react/no-unescaped-entities */
"use client";

import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f4f1] text-[#1d2b1f]">
      <Navbar variant="community" />

      <section className="bg-white py-32">
        <div className="mx-auto w-full max-w-4xl px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-semibold text-[#1b2b1e] mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-[#4a5a4f]">
              Last updated: {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <ScrollArea className="h-[calc(100vh-300px)] pr-4">
            <div className="prose prose-lg max-w-none prose-headings:text-[#1b2b1e] prose-p:text-[#4e5c51] prose-strong:text-[#1b2b1e] prose-ul:text-[#4e5c51] prose-ol:text-[#4e5c51]">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  1. Introduction
                </h2>
                <p className="mb-4">
                  Promenade Residence ("we," "our," or "us") is committed to protecting your
                  privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                  your information when you use our digital platform, services, and facilities.
                </p>
                <p>
                  By using our services, you consent to the data practices described in this policy.
                  If you do not agree with the practices described, please do not use our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  2. Information We Collect
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  2.1 Personal Information
                </h3>
                <p className="mb-3">We may collect the following personal information:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Identity Information:</strong> Name, date of birth, government-issued ID numbers</li>
                  <li><strong>Contact Information:</strong> Email address, phone number, mailing address</li>
                  <li><strong>Account Information:</strong> Username, password, account preferences</li>
                  <li><strong>Residency Information:</strong> Unit number, residency type, move-in date</li>
                  <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely)</li>
                  <li><strong>Vehicle Information:</strong> License plate number, vehicle registration details</li>
                </ul>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  2.2 Usage Information
                </h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage patterns and preferences</li>
                  <li>Log files and analytics data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  2.3 Automatically Collected Information
                </h3>
                <p className="mb-4">
                  We automatically collect certain information when you visit our platform, including
                  your IP address, browser type, access times, and pages viewed. This information
                  helps us improve our services and user experience.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="mb-3">We use the collected information for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>To provide and maintain our services</li>
                  <li>To process payments and manage billing</li>
                  <li>To manage amenity reservations and facility access</li>
                  <li>To communicate with you about services, updates, and announcements</li>
                  <li>To respond to your inquiries and provide customer support</li>
                  <li>To ensure security and prevent fraud</li>
                  <li>To comply with legal obligations</li>
                  <li>To improve our services and user experience</li>
                  <li>To send administrative information and important notices</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  4. Information Sharing and Disclosure
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  4.1 We Do Not Sell Your Information
                </h3>
                <p className="mb-4">
                  We do not sell, rent, or trade your personal information to third parties for
                  marketing purposes.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  4.2 Service Providers
                </h3>
                <p className="mb-4">
                  We may share your information with trusted service providers who assist us in
                  operating our platform, conducting business, or serving you, such as:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Payment processors</li>
                  <li>Cloud hosting services</li>
                  <li>Email service providers</li>
                  <li>Analytics and monitoring services</li>
                </ul>
                <p className="mb-4">
                  These service providers are contractually obligated to protect your information
                  and use it only for the purposes we specify.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  4.3 Legal Requirements
                </h3>
                <p className="mb-4">
                  We may disclose your information if required by law or in response to valid
                  requests by public authorities (e.g., court orders, government agencies).
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  4.4 Business Transfers
                </h3>
                <p className="mb-4">
                  In the event of a merger, acquisition, or sale of assets, your information may be
                  transferred as part of the transaction. We will notify you of any such change.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  5. Data Security
                </h2>
                <p className="mb-4">
                  We implement appropriate technical and organizational security measures to protect
                  your personal information against unauthorized access, alteration, disclosure, or
                  destruction. These measures include:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure data storage and backup procedures</li>
                  <li>Employee training on data protection</li>
                </ul>
                <p>
                  However, no method of transmission over the Internet or electronic storage is
                  100% secure. While we strive to protect your information, we cannot guarantee
                  absolute security.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  6. Your Rights and Choices
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  6.1 Access and Correction
                </h3>
                <p className="mb-4">
                  You have the right to access, update, or correct your personal information at any
                  time through your account settings or by contacting us directly.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  6.2 Data Deletion
                </h3>
                <p className="mb-4">
                  You may request deletion of your personal information, subject to legal and
                  contractual obligations that may require us to retain certain data.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  6.3 Opt-Out
                </h3>
                <p className="mb-4">
                  You can opt-out of non-essential communications by updating your preferences in
                  your account settings or by contacting us.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  6.4 Cookies
                </h3>
                <p className="mb-4">
                  You can control cookies through your browser settings. However, disabling cookies
                  may affect the functionality of our platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  7. Data Retention
                </h2>
                <p className="mb-4">
                  We retain your personal information for as long as necessary to fulfill the
                  purposes outlined in this policy, unless a longer retention period is required
                  or permitted by law. When we no longer need your information, we will securely
                  delete or anonymize it.
                </p>
                <p>
                  Account information is retained while your account is active and for a
                  reasonable period after account closure for legal and business purposes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  8. Children's Privacy
                </h2>
                <p className="mb-4">
                  Our services are not intended for individuals under the age of 18. We do not
                  knowingly collect personal information from children. If you believe we have
                  collected information from a child, please contact us immediately, and we will
                  take steps to delete such information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  9. Third-Party Links
                </h2>
                <p className="mb-4">
                  Our platform may contain links to third-party websites or services. We are not
                  responsible for the privacy practices of these external sites. We encourage you
                  to review the privacy policies of any third-party sites you visit.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  10. International Data Transfers
                </h2>
                <p className="mb-4">
                  Your information may be transferred to and processed in countries other than your
                  country of residence. We ensure that appropriate safeguards are in place to
                  protect your information in accordance with this Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  11. Changes to This Privacy Policy
                </h2>
                <p className="mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our
                  practices or for other operational, legal, or regulatory reasons. We will notify
                  you of any material changes by posting the new policy on this page and updating
                  the "Last updated" date.
                </p>
                <p>
                  Your continued use of our services after such changes constitutes acceptance of
                  the updated Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  12. Contact Us
                </h2>
                <p className="mb-4">
                  If you have questions, concerns, or requests regarding this Privacy Policy or our
                  data practices, please contact us:
                </p>
                <ul className="list-none space-y-2 mb-4">
                  <li>
                    <strong>Data Protection Officer:</strong> dpo@promenaderesidence.com
                  </li>
                  <li>
                    <strong>Management Office:</strong> (02) 1234-5678
                  </li>
                  <li>
                    <strong>Email:</strong> privacy@promenaderesidence.com
                  </li>
                  <li>
                    <strong>Address:</strong> Promenade Residence Management Office, [Address]
                  </li>
                </ul>
                <p>
                  We will respond to your inquiry within 30 days of receipt.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  13. Consent
                </h2>
                <p>
                  By using our services, you consent to the collection and use of your information
                  as described in this Privacy Policy. If you do not agree with any part of this
                  policy, please discontinue use of our services.
                </p>
              </section>
            </div>
          </ScrollArea>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default PrivacyPolicyPage;

