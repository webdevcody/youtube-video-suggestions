import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-of-service")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: July 21, 2025
        </p>

        <p className="mb-6">
          Please read these terms and conditions carefully before using Our
          Service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Interpretation and Definitions
        </h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">Interpretation</h3>
        <p className="mb-4">
          The words of which the initial letter is capitalized have meanings
          defined under the following conditions. The following definitions
          shall have the same meaning regardless of whether they appear in
          singular or in plural.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Definitions</h3>
        <p className="mb-4">For the purposes of these Terms and Conditions:</p>

        <div className="space-y-4 mb-6">
          <p>
            <strong>Affiliate</strong> means an entity that controls, is
            controlled by or is under common control with a party, where
            "control" means ownership of 50% or more of the shares, equity
            interest or other securities entitled to vote for election of
            directors or other managing authority.
          </p>

          <p>
            <strong>Content</strong> means any text, images, videos, audio, or
            other materials uploaded, submitted, or posted by You on the
            Service.
          </p>

          <p>
            <strong>Country</strong> refers to: Tennessee, United States
          </p>

          <p>
            <strong>Company</strong> (referred to as either "the Company", "We",
            "Us" or "Our" in this Agreement) refers to Seibert Software
            Solutions, LLC.
          </p>

          <p>
            <strong>Device</strong> means any device that can access the Service
            such as a computer, a cellphone or a digital tablet.
          </p>

          <p>
            <strong>Ideas</strong> means any concepts, suggestions, proposals,
            plans, or other creative input that You submit through the Service,
            including but not limited to YouTube video ideas, content concepts,
            titles, descriptions, or any other creative material.
          </p>

          <p>
            <strong>Service</strong> refers to the Website.
          </p>

          <p>
            <strong>Terms and Conditions</strong> (also referred as "Terms")
            mean these Terms and Conditions that form the entire agreement
            between You and the Company regarding the use of the Service.
          </p>

          <p>
            <strong>Third-party Social Media Service</strong> means any services
            or content (including data, information, products or services)
            provided by a third-party that may be displayed, included or made
            available by the Service.
          </p>

          <p>
            <strong>User-Generated Content</strong> means any Content, Ideas, or
            other materials that You create, upload, submit, or post through the
            Service.
          </p>

          <p>
            <strong>Website</strong> refers to Web Dev Cody, accessible from
            webdevcody.com or any sub domains of webdevcody.com
          </p>

          <p>
            <strong>You</strong> means the individual accessing or using the
            Service, or the company, or other legal entity on behalf of which
            such individual is accessing or using the Service, as applicable.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Acknowledgment</h2>
        <p className="mb-4">
          These are the Terms and Conditions governing the use of this Service
          and the agreement that operates between You and the Company. These
          Terms and Conditions set out the rights and obligations of all users
          regarding the use of the Service.
        </p>

        <p className="mb-4">
          Your access to and use of the Service is conditioned on Your
          acceptance of and compliance with these Terms and Conditions. These
          Terms and Conditions apply to all visitors, users and others who
          access or use the Service.
        </p>

        <p className="mb-4">
          By accessing or using the Service You agree to be bound by these Terms
          and Conditions. If You disagree with any part of these Terms and
          Conditions then You may not access the Service.
        </p>

        <p className="mb-6">
          Your access to and use of the Service is also conditioned on Your
          acceptance of and compliance with the Privacy Policy of the Company.
          Our Privacy Policy describes Our policies and procedures on the
          collection, use and disclosure of Your personal information when You
          use the Application or the Website and tells You about Your privacy
          rights and how the law protects You. Please read Our Privacy Policy
          carefully before using Our Service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          User-Generated Content and Ideas
        </h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">Submission of Ideas</h3>
        <p className="mb-4">
          Our Service allows You to submit Ideas for YouTube videos and other
          content. By submitting any Ideas through the Service, You acknowledge
          and agree that:
        </p>

        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            Your Ideas are submitted voluntarily and without any expectation of
            compensation, credit, or attribution
          </li>
          <li>
            Your Ideas become part of the public domain and may be used by
            anyone
          </li>
          <li>
            Similar or identical ideas may have been independently developed by
            Us or others
          </li>
          <li>
            We have no obligation to review, consider, or implement any Ideas
            You submit
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">
          Rights in User-Generated Content
        </h3>
        <p className="mb-4">
          By posting, uploading, submitting, or otherwise providing any
          User-Generated Content through the Service, You hereby grant to the
          Company:
        </p>

        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            A perpetual, irrevocable, worldwide, royalty-free, non-exclusive
            license to use, reproduce, modify, adapt, publish, translate, create
            derivative works from, distribute, and display such Content in any
            media format and through any channels
          </li>
          <li>
            The right to use Your Ideas for any purpose, including but not
            limited to creating YouTube videos, courses, products, or other
            content
          </li>
          <li>The right to sublicense these rights to third parties</li>
          <li>
            The right to use Your Ideas without attribution or compensation
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">Waiver of Rights</h3>
        <p className="mb-4">
          You expressly waive any and all rights You may have in Your
          User-Generated Content, including but not limited to:
        </p>

        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Copyright and intellectual property rights</li>
          <li>Moral rights and rights of attribution</li>
          <li>Rights to compensation or royalties</li>
          <li>Rights to control how Your Ideas are used or modified</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">No Confidentiality</h3>
        <p className="mb-4">
          You acknowledge that any Ideas or Content You submit through the
          Service are not confidential or proprietary. We assume no obligation
          to protect the confidentiality of any Ideas, and any such Ideas may be
          used or disclosed without restriction.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">
          Originality and Legal Rights
        </h3>
        <p className="mb-6">
          You represent and warrant that any User-Generated Content You submit:
        </p>

        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Is original to You or You have the right to submit it</li>
          <li>
            Does not infringe on any third party's intellectual property rights
          </li>
          <li>Does not violate any applicable laws or regulations</li>
          <li>
            Does not contain defamatory, offensive, or inappropriate material
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Intellectual Property Rights
        </h2>

        <p className="mb-4">
          The Service and its original content, features, and functionality are
          and will remain the exclusive property of the Company and its
          licensors. The Service is protected by copyright, trademark, and other
          laws. Our trademarks and trade dress may not be used in connection
          with any product or service without our prior written consent.
        </p>

        <p className="mb-6">
          Any Ideas submitted through the Service become the property of the
          Company and may be used without restriction. By submitting Ideas, You
          assign all rights, title, and interest in such Ideas to the Company.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Links to Other Websites
        </h2>
        <p className="mb-4">
          Our Service may contain links to third-party web sites or services
          that are not owned or controlled by the Company.
        </p>

        <p className="mb-4">
          The Company has no control over, and assumes no responsibility for,
          the content, privacy policies, or practices of any third party web
          sites or services. You further acknowledge and agree that the Company
          shall not be responsible or liable, directly or indirectly, for any
          damage or loss caused or alleged to be caused by or in connection with
          the use of or reliance on any such content, goods or services
          available on or through any such web sites or services.
        </p>

        <p className="mb-6">
          We strongly advise You to read the terms and conditions and privacy
          policies of any third-party web sites or services that You visit.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Termination</h2>
        <p className="mb-4">
          We may terminate or suspend Your access immediately, without prior
          notice or liability, for any reason whatsoever, including without
          limitation if You breach these Terms and Conditions.
        </p>

        <p className="mb-6">
          Upon termination, Your right to use the Service will cease
          immediately. However, all rights granted to the Company regarding Your
          User-Generated Content and Ideas shall survive termination.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Prohibited Content</h2>

        <p className="mb-4">You may not submit Ideas or Content that:</p>

        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Violates any applicable laws or regulations</li>
          <li>Infringes on the intellectual property rights of others</li>
          <li>Contains offensive, defamatory, or inappropriate material</li>
          <li>Promotes illegal activities or violence</li>
          <li>Contains malicious code or harmful content</li>
          <li>Violates the privacy rights of others</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Assignment and Ownership
        </h2>

        <p className="mb-4">
          By submitting any Ideas through the Service, You hereby irrevocably
          assign, transfer, and convey to the Company all of Your right, title,
          and interest in and to such Ideas, including all intellectual property
          rights therein. This assignment is effective immediately upon
          submission and requires no further action by either party.
        </p>

        <p className="mb-6">
          You acknowledge that You will have no recourse against the Company for
          any alleged or actual infringement or misappropriation of any
          proprietary right in Your communications to the Company.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Limitation of Liability
        </h2>

        <p className="mb-4">
          Notwithstanding any damages that You might incur, the entire liability
          of the Company and any of its suppliers under any provision of this
          Terms and Your exclusive remedy for all of the foregoing shall be
          limited to the amount actually paid by You through the Service or 100
          USD if You haven't purchased anything through the Service.
        </p>

        <p className="mb-4">
          To the maximum extent permitted by applicable law, in no event shall
          the Company or its suppliers be liable for any special, incidental,
          indirect, or consequential damages whatsoever (including, but not
          limited to, damages for loss of profits, loss of data or other
          information, for business interruption, for personal injury, loss of
          privacy arising out of or in any way related to the use of or
          inability to use the Service, third-party software and/or third-party
          hardware used with the Service, or otherwise in connection with any
          provision of this Terms), even if the Company or any supplier has been
          advised of the possibility of such damages and even if the remedy
          fails of its essential purpose.
        </p>

        <p className="mb-4">
          The Company shall not be liable for any claims, losses, damages, or
          expenses arising from or related to the use of Ideas submitted by
          users, including but not limited to claims that such use infringes
          third-party rights or violates applicable laws.
        </p>

        <p className="mb-6">
          Some states do not allow the exclusion of implied warranties or
          limitation of liability for incidental or consequential damages, which
          means that some of the above limitations may not apply to You. But in
          such a case the exclusions and limitations set forth in this section
          shall be applied to the greatest extent enforceable under applicable
          law.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          "AS IS" and "AS AVAILABLE" Disclaimer
        </h2>
        <p className="mb-4">
          The Service is provided to You "AS IS" and "AS AVAILABLE" and with all
          faults and defects without warranty of any kind. To the maximum extent
          permitted under applicable law, the Company, on its own behalf and on
          behalf of its Affiliates and its and their respective licensors and
          service providers, expressly disclaims all warranties, whether
          express, implied, statutory or otherwise, with respect to the Service,
          including all implied warranties of merchantability, fitness for a
          particular purpose, title and non-infringement, and warranties that
          may arise out of course of dealing, course of performance, usage or
          trade practice. Without limitation to the foregoing, the Company
          provides no warranty or undertaking, and makes no representation of
          any kind that the Service will meet Your requirements, achieve any
          intended results, be compatible or work with any other software,
          applications, systems or services, operate without interruption, meet
          any performance or reliability standards or be error free or that any
          errors or defects can or will be corrected.
        </p>

        <p className="mb-4">
          Without limiting the foregoing, neither the Company nor any of the
          company's provider makes any representation or warranty of any kind,
          express or implied: (i) as to the operation or availability of the
          Service, or the information, content, and materials or products
          included thereon; (ii) that the Service will be uninterrupted or
          error-free; (iii) as to the accuracy, reliability, or currency of any
          information or content provided through the Service; or (iv) that the
          Service, its servers, the content, or e-mails sent from or on behalf
          of the Company are free of viruses, scripts, trojan horses, worms,
          malware, timebombs or other harmful components.
        </p>

        <p className="mb-6">
          Some jurisdictions do not allow the exclusion of certain types of
          warranties or limitations on applicable statutory rights of a
          consumer, so some or all of the above exclusions and limitations may
          not apply to You. But in such a case the exclusions and limitations
          set forth in this section shall be applied to the greatest extent
          enforceable under applicable law.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Governing Law</h2>
        <p className="mb-6">
          The laws of the Country, excluding its conflicts of law rules, shall
          govern this Terms and Your use of the Service. Your use of the
          Application may also be subject to other local, state, national, or
          international laws.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Disputes Resolution
        </h2>
        <p className="mb-6">
          If You have any concern or dispute about the Service, You agree to
          first try to resolve the dispute informally by contacting the Company.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          For European Union (EU) Users
        </h2>
        <p className="mb-6">
          If You are a European Union consumer, you will benefit from any
          mandatory provisions of the law of the country in which you are
          resident in.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          United States Legal Compliance
        </h2>
        <p className="mb-6">
          You represent and warrant that (i) You are not located in a country
          that is subject to the United States government embargo, or that has
          been designated by the United States government as a "terrorist
          supporting" country, and (ii) You are not listed on any United States
          government list of prohibited or restricted parties.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Severability and Waiver
        </h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">Severability</h3>
        <p className="mb-4">
          If any provision of these Terms is held to be unenforceable or
          invalid, such provision will be changed and interpreted to accomplish
          the objectives of such provision to the greatest extent possible under
          applicable law and the remaining provisions will continue in full
          force and effect.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Waiver</h3>
        <p className="mb-6">
          Except as provided herein, the failure to exercise a right or to
          require performance of an obligation under these Terms shall not
          effect a party's ability to exercise such right or require such
          performance at any time thereafter nor shall the waiver of a breach
          constitute a waiver of any subsequent breach.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Translation Interpretation
        </h2>
        <p className="mb-6">
          These Terms and Conditions may have been translated if We have made
          them available to You on our Service. You agree that the original
          English text shall prevail in the case of a dispute.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Changes to These Terms and Conditions
        </h2>
        <p className="mb-4">
          We reserve the right, at Our sole discretion, to modify or replace
          these Terms at any time. If a revision is material We will make
          reasonable efforts to provide at least 30 days' notice prior to any
          new terms taking effect. What constitutes a material change will be
          determined at Our sole discretion.
        </p>

        <p className="mb-6">
          By continuing to access or use Our Service after those revisions
          become effective, You agree to be bound by the revised terms. If You
          do not agree to the new terms, in whole or in part, please stop using
          the website and the Service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
        <p className="mb-8">
          If you have any questions about these Terms and Conditions, You can
          contact us:
        </p>

        <p className="mb-8">
          By email:{" "}
          <a
            href="mailto:webdevcody@gmail.com"
            className="text-primary hover:underline"
          >
            webdevcody@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
