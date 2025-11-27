/* eslint-disable react/no-unescaped-entities */
"use client";

import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const GeneralPolicyPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f4f1] text-[#1d2b1f]">
      <Navbar variant="community" />

      <section className="bg-white py-32">
        <div className="mx-auto w-full max-w-4xl px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-semibold text-[#1b2b1e] mb-4">
              General Policy
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
                  Welcome to Promenade Residence. These General Policies govern your use of our
                  residential community services, facilities, and digital platforms. By accessing
                  or using our services, you agree to comply with and be bound by these policies.
                </p>
                <p>
                  Promenade Residence is committed to maintaining a safe, respectful, and
                  harmonious living environment for all residents and their guests.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  2. Community Rules and Regulations
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  2.1 General Conduct
                </h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>All residents must conduct themselves in a manner that respects the rights
                    and privacy of other residents.</li>
                  <li>Noise levels must be kept to a minimum, especially during quiet hours
                    (10:00 PM to 7:00 AM).</li>
                  <li>Residents are responsible for the conduct of their guests and family members.</li>
                  <li>Any behavior that disturbs the peace or safety of the community is prohibited.</li>
                </ul>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  2.2 Property Maintenance
                </h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Residents must maintain their units in good condition and report any
                    maintenance issues promptly.</li>
                  <li>Modifications to units require prior written approval from management.</li>
                  <li>Common areas must be kept clean and free of personal belongings.</li>
                  <li>Garbage and waste must be disposed of in designated areas only.</li>
                </ul>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  2.3 Amenities Usage
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Amenities must be reserved in advance through the official platform.</li>
                  <li>Residents are responsible for any damage caused during amenity use.</li>
                  <li>Guests must be accompanied by residents when using amenities.</li>
                  <li>All amenity rules and time limits must be strictly followed.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  3. Payment and Billing
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  3.1 Monthly Dues
                </h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Monthly dues are due on the first day of each month.</li>
                  <li>Late payments may incur penalties as specified in the payment terms.</li>
                  <li>Payment methods accepted include bank transfer, online payment, and cash
                    (at the management office).</li>
                  <li>Receipts will be issued for all payments made.</li>
                </ul>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  3.2 Amenity Reservations
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Reservation fees must be paid at the time of booking.</li>
                  <li>Cancellations made 24 hours in advance will receive a full refund.</li>
                  <li>No-shows will forfeit the reservation fee.</li>
                  <li>Refunds for approved cancellations will be processed within 5-7 business days.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  4. Vehicle and Parking
                </h2>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>All vehicles must be registered with the management office.</li>
                  <li>Parking is assigned and vehicles must be parked in designated areas only.</li>
                  <li>Unauthorized vehicles may be towed at the owner's expense.</li>
                  <li>Speed limit within the premises is 15 km/h.</li>
                  <li>Vehicle registration must be renewed annually.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  5. Pets Policy
                </h2>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Pets are allowed with prior approval from management.</li>
                  <li>Pet owners must provide vaccination records and registration documents.</li>
                  <li>Pets must be leashed in common areas and not left unattended.</li>
                  <li>Pet owners are responsible for cleaning up after their pets.</li>
                  <li>Aggressive or noisy pets may be subject to removal.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  6. Security and Access
                </h2>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>All residents must have valid access cards or keys.</li>
                  <li>Lost access cards must be reported immediately to security.</li>
                  <li>Guests must be registered and accompanied by residents.</li>
                  <li>Security personnel have the right to verify identity and purpose of visit.</li>
                  <li>Surveillance cameras are installed for security purposes.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  7. Prohibited Activities
                </h2>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Smoking in common areas and non-designated smoking zones.</li>
                  <li>Illegal activities of any kind.</li>
                  <li>Commercial activities without proper permits.</li>
                  <li>Storing hazardous materials or substances.</li>
                  <li>Unauthorized solicitation or distribution of materials.</li>
                  <li>Excessive noise or disturbances.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  8. Violations and Penalties
                </h2>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>First violation: Written warning.</li>
                  <li>Second violation: Fine as specified in the penalty schedule.</li>
                  <li>Third violation: Suspension of privileges or eviction proceedings.</li>
                  <li>Serious violations may result in immediate action without prior warnings.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  9. Dispute Resolution
                </h2>
                <p className="mb-4">
                  Residents are encouraged to resolve disputes amicably. If resolution cannot be
                  reached, the matter should be brought to the attention of the management office.
                  Management will investigate and provide a resolution within 30 days.
                </p>
                <p>
                  For serious disputes, residents may request mediation or file a formal complaint
                  following the established procedures.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  10. Amendments
                </h2>
                <p className="mb-4">
                  Promenade Residence reserves the right to amend these policies at any time.
                  Residents will be notified of significant changes through official channels at
                  least 30 days before implementation.
                </p>
                <p>
                  Continued use of services after policy changes constitutes acceptance of the
                  updated policies.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  11. Contact Information
                </h2>
                <p className="mb-2">
                  For questions or concerns regarding these policies, please contact:
                </p>
                <ul className="list-none space-y-2">
                  <li>
                    <strong>Management Office:</strong> (02) 1234-5678
                  </li>
                  <li>
                    <strong>Email:</strong> management@promenaderesidence.com
                  </li>
                  <li>
                    <strong>Office Hours:</strong> Monday to Friday, 8:00 AM - 5:00 PM
                  </li>
                  <li>
                    <strong>Emergency Hotline:</strong> (02) 1234-9999 (24/7)
                  </li>
                </ul>
              </section>
            </div>
          </ScrollArea>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default GeneralPolicyPage;

