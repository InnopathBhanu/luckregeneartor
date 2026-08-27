/*
 * /privacy-policy — TRANSCRIBED LEGACY TEXT. Conflict 38.
 *
 * The legacy page nests bold list-items under h4 headings; that nesting flattens here into sections with
 * optional headings, paragraphs and lists — the TEXT is verbatim, the outline depth is not (the shared
 * information-page template renders one heading level under the H1). Inline links to the contact page
 * flatten to their anchor text; the page's Related block links /contact-us instead.
 *
 * Flagged clauses (the product no longer matches them): purchases and Payment Information (no first-party
 * checkout exists), email marketing and administrative email (no delivery channel exists), sweepstakes and
 * promotions, data-enhancement marketing, the two references to "Your Choices" / "Your Options" sections
 * that do not exist anywhere on the legacy page, the "operate the Site from the India" location statement,
 * and the under-18 rule that contradicts the terms page's 21+ restriction.
 */

import { FOUNDER_LEGAL_REVIEW, type TrustPageContent } from "../trustContract";

export const PRIVACY_CONTENT: TrustPageContent = {
  path: "/privacy-policy",
  title: "Privacy Policy",
  description: "Lottery Corner , Privacy Policy.",
  intro:
    "LotteryCorner.com , (\"we\" or \"us\") wants you to be familiar with what information we collect about "
    + "you, how the information is being used and what choices you have regarding the collection and use of "
    + "the information. This Privacy Policy (the \"Policy\") describes our practices in connection with "
    + "information that we collect through our websites (collectively, the \"Site\"). Please take a moment "
    + "to review this Policy and feel free to contact us with any questions at contact us.",
  sections: [
    {
      paragraphs: [
        "By using the Site, you agree to the terms of this Policy. If you do not agree to the terms of this "
        + "Policy, please do not use the Site. We reserve the right to change this Policy without prior "
        + "notice. You agree to obtain annual notices of, and changes to, this Policy electronically by "
        + "visiting this Site. Any changes to our Policy will become effective upon our posting of the "
        + "revised Policy on the Site. Use of the Site following such changes constitutes your acceptance "
        + "of the revised Policy then in effect. Therefore, we encourage you to review this Site from time "
        + "to time for changes to our Policy.",
      ],
    },
    {
      heading: "What type of Information we collect about you..",
      paragraphs: [
        "We collect personal information and non-personal information through the Site. Personal "
        + "information is information that identifies you as an individual. Non-personal information is "
        + "aggregated information, demographic information, IP addresses and any other information that "
        + "does not reveal your specific identity",
      ],
    },
    {
      heading: "Personal information",
      paragraphs: ["We may collect the following types of personal information:"],
      list: [
        "Information provided by you when ordering any service or products through the Site. For example, "
        + "you will be required to submit personal information such as your name, address and e-mail "
        + `address ${FOUNDER_LEGAL_REVIEW}`,
        "When you make a purchase through the Site, we may collect your credit card number or other payment "
        + "account number, billing address and other information related to such purchase (known as "
        + `"Payment Information") from you. ${FOUNDER_LEGAL_REVIEW}`,
        "Information you provide us through contact us page for correspondence and general feedback",
      ],
    },
    {
      heading: "Non-Personal information",
      paragraphs: [
        "When you visit the Site, we may collect non-personal information, such as a catalog of the Site "
        + "pages you visit. Non-personal information is generally collected through the Site from the "
        + "following sources: server log files, environmental variables, cookies, pixel tags and other "
        + "similar technologies and information that you voluntarily provide",
      ],
      list: [
        "Server Log Files : Your Internet Protocol (IP) address is a number that is automatically assigned "
        + "to the computer that you are using by your Internet Service Provider (ISP). This number is "
        + "identified and logged automatically in our server log files whenever you visit the Site, along "
        + "with the time(s) of your visit(s) and the page(s) that you visited. We use your IP address, and "
        + "the IP addresses of all users, for purposes such as calculating Site usage levels, helping "
        + "diagnose problems with the Site's servers, and administering the Site. Collecting IP addresses "
        + "is standard practice on the Internet and is done automatically by many websites.",
        "Environmental Variables: We and our service providers may also collect certain environmental "
        + "variables, such as computer type (Windows or Macintosh), screen resolution, OS version, Internet "
        + "browser, and Internet browser version. These environmental variables are collected by most "
        + "browsers, and can be used to optimize your experience on the Site",
        "Cookies and Similar Technologies: We and our service providers may use \"cookies\" or similar "
        + "technologies on the Site. Cookies are data that a web server transfers to an individual's "
        + "computer for recordkeeping purposes. Cookies are an industry standard used by many websites, and "
        + "can facilitate your ongoing access to and use of a particular website; cookies do not cause "
        + "damage to your computer systems or files. If you do not want information collected through the "
        + "use of cookies, there is a simple procedure in most browsers that allows you to automatically "
        + "decline cookies, or to be given the choice of declining or accepting the transfer of a "
        + "particular cookie, or cookies from a particular website, to your computer. Additionally, please "
        + "see the \"Your Choices\" section below for instructions on how to opt-out of sharing certain "
        + `information related to the use of cookies. ${FOUNDER_LEGAL_REVIEW}`,
        "Information That You Voluntarily Provide. We also collect non-personal information (e.g., your "
        + "geographic location, etc.) when you voluntarily provide such information to us. When such "
        + "information is not combined with any personal information, such information is considered to be "
        + "non-personal information, as it does not personally identify you or any other user. "
        + "Additionally, we may aggregate personal information in a manner such that the end-product does "
        + "not personally identify you or any other user of the Site, for example, by using personal "
        + "information to calculate the percentage of our users who have a particular telephone area code. "
        + "Such aggregate information is considered non-personal information for purposes of this Policy.",
      ],
    },
    {
      paragraphs: [
        "Please note that if we combine any non-personal information with personal information, the "
        + "combined information will be treated by us as personal information as long as it is so combined.",
      ],
    },
    {
      heading: "How do we use the collected information",
    },
    {
      heading: "Personal Information",
      paragraphs: ["We may use personal information we collect in the following ways:"],
      list: [
        "Fulfillment of Requests : We may use personal information collected about you to provide you with "
        + "products, services or information that you request.",
        "Administrative Communications : From time to time we may use personal information to send to you "
        + "important information regarding the Site, or changes to our terms, conditions, and policies. "
        + "Because this information may be important to your use of the Site, you may not opt-out of "
        + `receiving such communications. ${FOUNDER_LEGAL_REVIEW}`,
        "Other Communications : From time to time, we may use personal information to inform you of "
        + "products, programs, services and promotions that we believe may be of interest to you. If you "
        + "would prefer that we do not send such email marketing messages to you, please see the \"Your "
        + `Choices" section below. ${FOUNDER_LEGAL_REVIEW}`,
        `Purchases : We may use personal information, including Payment Information in order to fulfill `
        + `your purchase. ${FOUNDER_LEGAL_REVIEW}`,
        "Promotions : We may operate sweepstakes, contests and similar promotions (collectively, "
        + "\"Promotions\") through the Site. We typically ask you for certain personal information when you "
        + "enter and, if applicable, win a Promotion. You should carefully review the rules, if any, of "
        + "each Promotion in which you participate through the Site, as they may contain additional "
        + "important information about our use of personal information. To the extent that the terms and "
        + "conditions of such rules concerning the treatment of personal information conflict with this "
        + `Policy, the terms and conditions of such rules will control. ${FOUNDER_LEGAL_REVIEW}`,
        "Internal Business Purposes : We may also use personal information for our internal business "
        + "purposes, such as data analysis and audits. In addition, we may also use personal information to "
        + "enhance our information and to aid us in providing our customers with targeted promotions.",
      ],
    },
    {
      heading: "Non-Personal Information",
      paragraphs: [
        "Because non-personal information does not personally identify you, we may use such information "
        + "for any purpose. In addition, we reserve the right to disclose such non personal information to "
        + "other third parties, for any purpose.",
        "In some instances, we may combine non-personal information with personal information. If we "
        + "combine any non-personal information with personal information so that it personally identifies "
        + "you, the combined information will be treated by us as personal information as long as it is "
        + "combined.",
        "We may, along with our affiliates and marketing partners enhance and/or merge personal information "
        + "about you with data collected from other sources and use it in direct and/or online marketing "
        + "and, to the extent permitted by law, individual reference and look-up service programs. In the "
        + "event we enhance and/or merge such personal information with data collected from other sources, "
        + "we will take reasonable steps to maintain the integrity and quality of that information. "
        + FOUNDER_LEGAL_REVIEW,
      ],
    },
    {
      heading: "Do we disclose the information to third parties?, Yes selected Information",
      list: [
        "Affiliates We may disclose the information that we collect to our affiliated companies to provide "
        + "the products you request, to enhance our products to better suit your needs, and from time to "
        + "time for marketing purposes.",
        "Business Partners We may partner with other companies to offer you products or services or to "
        + "fulfill the products or services that you order. We may disclose personal information and/or "
        + "non-personal or de-identified information collected about you to such third-party partners for "
        + "the purposes described in this Policy.",
        "Service Providers We work with third parties who provide services including but not limited to "
        + "data analysis, order fulfillment, list enhancement and other administrative services. We may "
        + "disclose personal information to such third parties for the purpose of enabling these third "
        + "parties to provide services to us. Such services may include: marketing distribution, email list "
        + "management services, advertising, certain product functionalities, customer support, web "
        + "hosting, customer data management and enhancement, fulfillment services (e.g., companies that "
        + `handles the payment processing), research and surveys, data analysis and email service. `
        + FOUNDER_LEGAL_REVIEW,
        "Assignment We reserve the right to transfer any and all information that we collect from Site "
        + "users to an affiliate or a third party in the event of any reorganization, merger, sale, joint "
        + "venture, assignment, transfer or other disposition of all or any portion of our business, assets "
        + "or stock (including without limitation in connection with any bankruptcy or similar "
        + "proceedings).",
        "Law enforcement; emergencies; compliance; other purposes permitted by law Notwithstanding any "
        + "other provision of this Policy to the contrary, we reserve the right to disclose personal "
        + "information to others as we believe appropriate (a) to comply with legal process; (b) to respond "
        + "to governmental requests; (c) to enforce our Terms of Use; (d) to protect the rights, privacy, "
        + "safety or property of LotteryCorner.com and our affiliated companies, you or others; (e) to "
        + "permit us to pursue available remedies or limit the damages that we may sustain; and (f) for any "
        + "other purpose permitted by applicable law.",
        "Aggregate, Non-Personal, or De-identified Information We may share aggregated information (i.e., "
        + "information about you and other customers collectively, but not specifically identifiable to "
        + "you) and other non-personal, de-identified, or anonymous information we collect with third "
        + "parties, including affiliates to develop and deliver targeted advertising on our Site and on the "
        + "websites of third parties. If you would prefer that we do not utilize cookies with your website "
        + "experience, or would prefer to restrict the use of cookies with network advertising partners, "
        + `please see the "Your Options" section below. ${FOUNDER_LEGAL_REVIEW}`,
      ],
    },
    {
      heading: "We protect your Information",
      paragraphs: [
        "We have security measures and tools, such as firewalls, in place to help protect against the "
        + "loss, misuse and alteration of the information under our control. Unfortunately, no data "
        + "transmission over the Internet or data storage system can be guaranteed to be 100% secure. If "
        + "you have reason to believe that your interaction with us is no longer secure (for example, if "
        + "you feel that the security of any account you might have with us has been compromised), please "
        + "notify us of the problem as soon as possible by Contacting us",
      ],
    },
    {
      heading: "Links on our site",
      paragraphs: [
        "The Site may contain links to third-party websites. These linked sites are not under our control "
        + "and we are not responsible for the privacy practices or the contents of any such linked site, or "
        + "any link contained in any linked site. We provide such links only as a convenience, and the "
        + "inclusion of a link on the Site does not imply endorsement of the linked site by us. If you "
        + "provide any personal information through any such third-party website, your transaction will "
        + "occur on the third party's website (not the Site) and the personal information you provide will "
        + "be collected by, and controlled by the privacy policy of, that third party. We recommend that "
        + "you familiarize yourself with the privacy policies and practices of any third parties. PLEASE "
        + "NOTE THAT THIS POLICY DOES NOT ADDRESS THE PRIVACY OR INFORMATION PRACTICES OF ANY THIRD "
        + "PARTIES.",
      ],
    },
    {
      heading: "Location",
      paragraphs: [
        "We control and operate the Site from the India, and the Site is not intended to subject us to the "
        + "laws or jurisdiction of any state, country or territory other than that of the India. We do not "
        + "represent or warrant that the Site, or any part thereof, is appropriate or available for use in "
        + "any particular jurisdiction. Those who choose to access the Site do so on their own initiative "
        + "and at their own risk, and are responsible for complying with all local laws, rules and "
        + "regulations. We may limit the Site's availability, in whole or in part, to any person, "
        + `geographic area or jurisdiction we choose, at any time and in our sole discretion. `
        + FOUNDER_LEGAL_REVIEW,
      ],
    },
    {
      heading: "A special note for individuals under 18 years old",
      paragraphs: [
        "The Site is not directed to individuals under the age of eighteen (18), and we request that such "
        + "individuals not provide personal information through the Site. If you are under 18 years of age, "
        + "you may browse our Site; however, you may not provide personal information to us such as name, "
        + "address, or email address, and you may not register for, enroll in, and/or make product "
        + `purchases. ${FOUNDER_LEGAL_REVIEW}`,
      ],
    },
  ],
  provenance: {
    sourceFile:
      "00-reference-existing-project/LotteryCorner40/WebContent/WEB-INF/upgrade/privacy_policy_upgrade.jsp",
    transcriptionDate: "2026-08-12",
    note:
      "The full body, verbatim and in legacy order. The legacy nesting of bold list-items under h4 headings "
      + "flattens to sections and lists; inline links to the contact page flatten to their anchor text. The "
      + "legacy H1's stray game-name property was template debris, not text, and was not carried.",
  },
  reviewNotes: [
    `The page twice directs readers to a "Your Choices" / "Your Options" section that does not exist `
    + `anywhere on the legacy page — the promised opt-out instructions were never published. `
    + FOUNDER_LEGAL_REVIEW,
  ],
};
