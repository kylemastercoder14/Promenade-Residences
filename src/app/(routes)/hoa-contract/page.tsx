/* eslint-disable react/no-unescaped-entities */
"use client";

import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const HOAContractPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f4f1] text-[#1d2b1f]">
      <Navbar variant="community" />

      <section className="bg-white py-32">
        <div className="mx-auto w-full max-w-4xl px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-semibold text-[#1b2b1e] mb-4">
              Homeowners Association (HOA) Contract
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
                  Article I: Definitions
                </h2>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>"Association"</strong> means the Promenade Residence Homeowners
                    Association, a non-stock, non-profit corporation organized under the laws of
                    the Philippines.</li>
                  <li><strong>"Owner"</strong> means the person or entity holding legal title to a
                    unit in Promenade Residence.</li>
                  <li><strong>"Unit"</strong> means a residential lot, building, or condominium
                    unit within Promenade Residence.</li>
                  <li><strong>"Common Areas"</strong> means all areas, facilities, and amenities
                    within Promenade Residence that are not individually owned.</li>
                  <li><strong>"Board"</strong> means the Board of Directors of the Association.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  Article II: Membership and Voting Rights
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  2.1 Membership
                </h3>
                <p className="mb-4">
                  Every person or entity who is a record owner of a fee or undivided fee interest in
                  any unit which is subject to this contract shall be a member of the Association.
                  Membership shall be appurtenant to and may not be separated from ownership of
                  any unit.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  2.2 Voting Rights
                </h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Each unit owner shall be entitled to one vote per unit owned.</li>
                  <li>Voting rights may be exercised in person or by proxy.</li>
                  <li>Proxies must be in writing and filed with the Association before the meeting.</li>
                  <li>Voting on matters affecting the Association shall be conducted in accordance
                    with the bylaws.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  Article III: Association Powers and Duties
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  3.1 Powers
                </h3>
                <p className="mb-3">The Association shall have the power to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Adopt and amend bylaws, rules, and regulations</li>
                  <li>Maintain, repair, and improve common areas and facilities</li>
                  <li>Collect assessments and fees from unit owners</li>
                  <li>Enforce covenants, conditions, and restrictions</li>
                  <li>Contract for services necessary for the operation of the community</li>
                  <li>Purchase insurance for common areas and Association operations</li>
                  <li>Exercise all other powers granted by law and this contract</li>
                </ul>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  3.2 Duties
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintain common areas in good condition</li>
                  <li>Provide security and safety services</li>
                  <li>Manage Association finances and prepare annual budgets</li>
                  <li>Hold regular meetings and maintain records</li>
                  <li>Enforce rules and regulations fairly and consistently</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  Article IV: Assessments and Fees
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  4.1 Regular Assessments
                </h3>
                <p className="mb-4">
                  Each unit owner is obligated to pay monthly assessments to the Association for
                  the maintenance, operation, and improvement of common areas and facilities. The
                  amount of assessments shall be determined by the Board and may be adjusted
                  annually based on the Association's budget needs.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  4.2 Special Assessments
                </h3>
                <p className="mb-4">
                  In addition to regular assessments, the Association may levy special assessments
                  for capital improvements, major repairs, or other extraordinary expenses. Special
                  assessments require approval by a majority vote of the unit owners.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  4.3 Late Fees and Penalties
                </h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Assessments are due on the first day of each month.</li>
                  <li>Late fees may be imposed for payments received after the due date.</li>
                  <li>Interest may accrue on overdue amounts at the rate specified in the bylaws.</li>
                  <li>The Association may suspend privileges for owners with delinquent accounts.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  Article V: Use Restrictions
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  5.1 Residential Use
                </h3>
                <p className="mb-4">
                  Units shall be used primarily for residential purposes. Commercial activities
                  require prior written approval from the Board and must comply with applicable
                  laws and regulations.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  5.2 Alterations and Modifications
                </h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>No structural alterations or modifications may be made without Board approval.</li>
                  <li>Exterior modifications must maintain architectural consistency.</li>
                  <li>Interior modifications must comply with building codes and safety standards.</li>
                </ul>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  5.3 Nuisance
                </h3>
                <p className="mb-4">
                  No unit owner shall create or permit any nuisance, or use their unit in any way
                  that interferes with the peaceful enjoyment of other residents. This includes
                  excessive noise, odors, or other disturbances.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  Article VI: Common Areas and Facilities
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  6.1 Ownership and Use
                </h3>
                <p className="mb-4">
                  Common areas and facilities are owned by the Association for the benefit of all
                  unit owners. All unit owners have the right to use common areas in accordance
                  with the rules and regulations established by the Board.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  6.2 Maintenance Responsibility
                </h3>
                <p className="mb-4">
                  The Association is responsible for maintaining, repairing, and replacing common
                  areas and facilities. Unit owners are responsible for any damage they cause to
                  common areas.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  6.3 Amenity Reservations
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Amenities may be reserved by unit owners in accordance with Association rules.</li>
                  <li>Reservation fees may be required for certain amenities.</li>
                  <li>Guests must be accompanied by the reserving unit owner.</li>
                  <li>Violation of amenity rules may result in suspension of reservation privileges.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  Article VII: Insurance and Liability
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  7.1 Association Insurance
                </h3>
                <p className="mb-4">
                  The Association shall maintain comprehensive general liability insurance and
                  property insurance for common areas. The cost of such insurance shall be included
                  in the regular assessments.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  7.2 Unit Owner Insurance
                </h3>
                <p className="mb-4">
                  Each unit owner is responsible for maintaining their own insurance for their unit
                  and personal property. The Association is not responsible for damage to
                  individual units or personal property.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  7.3 Limitation of Liability
                </h3>
                <p className="mb-4">
                  The Association, its directors, officers, and agents shall not be liable for any
                  damage or injury to persons or property arising from the use of common areas,
                  except in cases of gross negligence or willful misconduct.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  Article VIII: Board of Directors
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  8.1 Composition
                </h3>
                <p className="mb-4">
                  The affairs of the Association shall be managed by a Board of Directors elected
                  by the unit owners. The Board shall consist of an odd number of directors, as
                  specified in the bylaws.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  8.2 Powers and Duties
                </h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Manage Association business and affairs</li>
                  <li>Adopt and enforce rules and regulations</li>
                  <li>Prepare and approve annual budgets</li>
                  <li>Appoint officers and committees</li>
                  <li>Enter into contracts on behalf of the Association</li>
                </ul>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  8.3 Meetings
                </h3>
                <p className="mb-4">
                  The Board shall hold regular meetings as specified in the bylaws. Special meetings
                  may be called by the President or a majority of the Board members. Unit owners
                  shall be notified of meetings in accordance with the bylaws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  Article IX: Enforcement
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  9.1 Violations
                </h3>
                <p className="mb-4">
                  Any violation of this contract, the bylaws, or rules and regulations may result in
                  enforcement action by the Association, including but not limited to fines,
                  suspension of privileges, or legal action.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  9.2 Fines and Penalties
                </h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>The Board may establish a schedule of fines for violations.</li>
                  <li>Fines must be reasonable and related to the violation.</li>
                  <li>Unit owners shall be given notice and an opportunity to be heard before
                    fines are imposed.</li>
                  <li>Unpaid fines may be added to the unit owner's assessment account.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  Article X: Amendments
                </h2>
                <p className="mb-4">
                  This contract may be amended by the affirmative vote of at least two-thirds (2/3)
                  of the unit owners. Proposed amendments must be submitted in writing to all unit
                  owners at least thirty (30) days before the vote. Amendments shall become effective
                  upon recording with the appropriate government office.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  Article XI: Dispute Resolution
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  11.1 Mediation
                </h3>
                <p className="mb-4">
                  Disputes between the Association and unit owners, or between unit owners, should
                  first be addressed through informal discussion. If resolution cannot be reached,
                  parties are encouraged to participate in mediation before pursuing legal action.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  11.2 Arbitration
                </h3>
                <p className="mb-4">
                  Certain disputes may be subject to binding arbitration in accordance with the
                  rules of the Philippine Dispute Resolution Center or similar organization.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  Article XII: General Provisions
                </h2>
                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  12.1 Severability
                </h3>
                <p className="mb-4">
                  If any provision of this contract is found to be invalid or unenforceable, the
                  remaining provisions shall continue in full force and effect.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  12.2 Governing Law
                </h3>
                <p className="mb-4">
                  This contract shall be governed by and construed in accordance with the laws of
                  the Philippines.
                </p>

                <h3 className="text-xl font-semibold text-[#1b2b1e] mb-3">
                  12.3 Binding Effect
                </h3>
                <p className="mb-4">
                  This contract shall be binding upon and inure to the benefit of the Association,
                  all unit owners, and their respective heirs, successors, and assigns.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1b2b1e] mb-4">
                  Article XIII: Contact Information
                </h2>
                <p className="mb-2">
                  For questions regarding this contract or Association matters, please contact:
                </p>
                <ul className="list-none space-y-2 mb-4">
                  <li>
                    <strong>HOA Office:</strong> (02) 1234-5678
                  </li>
                  <li>
                    <strong>Email:</strong> hoa@promenaderesidence.com
                  </li>
                  <li>
                    <strong>Office Hours:</strong> Monday to Friday, 8:00 AM - 5:00 PM
                  </li>
                  <li>
                    <strong>Address:</strong> Promenade Residence HOA Office, [Address]
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <div className="rounded-lg border border-[#e1e3dc] bg-[#f7f7f3] p-6">
                  <p className="text-sm text-[#4a5a4f] mb-4">
                    <strong>Note:</strong> This is a summary of the HOA Contract. The complete
                    contract document, including all exhibits and attachments, is available for
                    review at the HOA office. Unit owners are encouraged to read the full contract
                    and consult with legal counsel if needed.
                  </p>
                  <p className="text-sm text-[#4a5a4f]">
                    By purchasing or occupying a unit in Promenade Residence, you acknowledge that
                    you have read, understood, and agree to be bound by the terms of this contract
                    and all amendments thereto.
                  </p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default HOAContractPage;

