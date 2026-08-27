/*
 * /cookies-policy — TRANSCRIBED LEGACY TEXT. Conflict 38.
 *
 * The prose and the five cookie-inventory tables are carried verbatim, typos included ("A part form",
 * "Unclassied", the stray "I" in "Strictly Necessary cookies I"). The legacy page's own closing sentence
 * dates the document March 19, 2021 — that date renders as the page's last-updated line, because it is the
 * one honest date this text has.
 *
 * Flagged: every inventory table (the enumeration predates the rebuild — JSESSIONID is the legacy JSP
 * session cookie, and AddThis/ShareThis are retired services), the social-media-cookies prose, and the
 * external InternetCookies.org reference (the hyperlink is not carried; a policy page links same-site only).
 */

import { FOUNDER_LEGAL_REVIEW, type TrustPageContent } from "../trustContract";

const COOKIE_TABLE_HEADERS = ["Cookie key", "Domain", "Path", "Cookie type", "Expiration", "Description"];

export const COOKIES_CONTENT: TrustPageContent = {
  path: "/cookies-policy",
  title: "Cookies Policy",
  description:
    "Cookies Policy of Lottery Corner - Lottery - Winning Numbers, Analysis, Smart Picks and FREE lottery "
    + "systems.",
  intro:
    "This cookie policy (\"Policy\") describes what cookies are and how and they're being used by the "
    + "lotterycorner.com website (\"Website\" or \"Service\") and any of its related products and services "
    + "(collectively, \"Services\"). This Policy is a legally binding agreement between you (\"User\", "
    + "\"you\" or \"your\") and this Website operator (\"Operator\", \"we\", \"us\" or \"our\"). You should "
    + "read this Policy so you can understand the types of cookies we use, the information we collect using "
    + "cookies and how that information is used. It also describes the choices available to you regarding "
    + "accepting or declining the use of cookies. For further information on how we use, store and keep "
    + "your personal data secure, see our privacy policy.",
  sections: [
    {
      heading: "What are cookies?",
      paragraphs: [
        "Cookies are small pieces of data stored in text files that are saved on your computer or other "
        + "devices when websites are loaded in a browser. They are widely used to remember you and your "
        + "preferences, either for a single visit (through a \"session cookie\") or for multiple repeat "
        + "visits (using a \"persistent cookie\").",
        "To know more about how Cookies work in general please visit InternetCookies.org. "
        + FOUNDER_LEGAL_REVIEW,
        "Session cookies are temporary cookies that are used during the course of your visit to the "
        + "Website, and they expire when you close the web browser.",
        "Persistent cookies are used to remember your preferences within our Website and remain on your "
        + "desktop or mobile device even after you close your browser or restart your computer. They ensure "
        + "a consistent and efficient experience for you while visiting the Website and Services.",
        "Cookies may be set by the Website (\"first-party cookies\"), or by third parties, such as those "
        + "who serve content or provide advertising or analytics services on the Website (\"third party "
        + "cookies\"). These third parties can recognize you when you visit our website and also when you "
        + "visit certain other websites. You may learn more about cookies and how they work in this guide.",
      ],
    },
    {
      heading: "What type of cookies do we use?",
    },
    {
      heading: "Necessary cookies",
      paragraphs: [
        "Necessary cookies allow us to offer you the best possible experience when accessing and navigating "
        + "through our Website and using its features. For example, these cookies let us recognize that you "
        + "have created an account and have logged into that account to access the content.",
      ],
    },
    {
      heading: "Functionality cookies",
      paragraphs: [
        "Functionality cookies let us operate the Website and Services in accordance with the choices you "
        + "make. For example, we will recognize your username and remember how you customized the Website "
        + "and Services during future visits.",
      ],
    },
    {
      heading: "Analytical cookies",
      paragraphs: [
        "These cookies enable us and third party services to collect aggregated data for statistical "
        + "purposes on how our visitors use the Website. These cookies do not contain personal information "
        + "such as names and email addresses and are used to help us improve your user experience of the "
        + "Website.",
      ],
    },
    {
      heading: "Social media cookies",
      paragraphs: [
        "Third party cookies from social media sites (such as Facebook, Twitter, etc) let us track social "
        + "network users when they visit or use the Website and Services, or share content, by using a "
        + `tagging mechanism provided by those social networks. ${FOUNDER_LEGAL_REVIEW}`,
        "These cookies are also used for event tracking and remarketing purposes. Any data collected with "
        + "these tags will be used in accordance with our and social networks' privacy policies. We will "
        + "not collect or share any personally identifiable information from the user.",
      ],
    },
    {
      heading: "What are your cookie options?",
      paragraphs: [
        "If you don't like the idea of cookies or certain types of cookies, you can change your browser's "
        + "settings to delete cookies that have already been set and to not accept new cookies. To learn "
        + "more about how to do this, visit internetcookies.org",
        "Please note, however, that if you delete cookies or do not accept them, you might not be able to "
        + "use all of the features the Website and Services offer.",
      ],
    },
    {
      heading: "Changes and amendments",
      paragraphs: [
        "We reserve the right to modify this Policy or its terms relating to the Website and Services at "
        + "any time, effective upon posting of an updated version of this Policy on the Website. When we "
        + "do, we will revise the updated date at the bottom of this page. Continued use of the Website and "
        + "Services after any such changes shall constitute your consent to such changes.",
      ],
    },
    {
      heading: "Acceptance of this policy",
      paragraphs: [
        "You acknowledge that you have read this Policy and agree to all its terms and conditions. By "
        + "accessing and using the Website and Services you agree to be bound by this Policy. If you do not "
        + "agree to abide by the terms of this Policy, you are not authorized to access or use the Website "
        + "and Services.",
      ],
    },
    {
      heading: `Strictly Necessary cookies I ${FOUNDER_LEGAL_REVIEW}`,
      table: {
        headers: COOKIE_TABLE_HEADERS,
        rows: [
          ["JSESSIONID", ".lotterycorner.com", "/", "First-party", "Session",
            "General purpose platform session cookie,used by sites written in JSP. Usually used to maintain "
            + "an anonymous user session by the server."],
        ],
      },
    },
    {
      heading: `Performance cookies ${FOUNDER_LEGAL_REVIEW}`,
      table: {
        headers: COOKIE_TABLE_HEADERS,
        rows: [
          ["_ga", ".lotterycorner.com", "/", "First-party", "2 years",
            "This cookie name is associated with Google Universal Analytics - which is a significant update "
            + "to Google's more commonly used analytics service. This cookie is used to distinguish unique "
            + "users by assigning a randomly generated number as a client identifier. It is included in each "
            + "page request in as site and use to calculate visitor , session and campaign data for site "
            + "analytics reports.By default, it is set to expire in 2 years,although this is customizable by "
            + "web-site owners."],
          ["_gid", ".lotterycorner.com", "/", "First-party", "1 day",
            "This cookie name is associated with Google Universal Analytics. This appears to be a new cookie "
            + "and as of Spring 2017 no information is available from Google. It appears to store and update "
            + "a unique value for each page visited."],
          ["_gat", ".lotterycorner.com", "/", "First-party", "6 seconds",
            "This cookie name is associated with Google Universal Analytics, according to documentation it "
            + "is used to throttle the request rate - limiting the collection of data on high traffic sites. "
            + "It expires after 10 minutes."],
        ],
      },
    },
    {
      heading: `Targeting cookies ${FOUNDER_LEGAL_REVIEW}`,
      table: {
        headers: COOKIE_TABLE_HEADERS,
        rows: [
          ["uvc", ".addthis.com", "/", "Third-party", "1 year",
            "Tracks how often a user interacts with AddThis"],
          ["loc", ".addthis.com", "/", "Third-party", "1 year",
            "Stores the visitors geolocation to record location of sharer"],
          ["_stid", ".sharethis.com", "/", "Third-party", "1 year",
            "Randomly generated unique identifier - used for interest profiling for advertising"],
          ["IDE", ".doubleclick.net", "/", "Third-party", "1 year",
            "This cookie carries out information about how the end user uses the website and any "
            + "advertising that the end user may have seen before visiting the said website."],
          ["DSID", ".doubleclick.net", "/", "Third-party", "1 hour",
            "This cookie is set to note your specific user identity. It contains a hashed/encrypted unique "
            + "ID."],
        ],
      },
    },
    {
      heading: `Functionality cookies ${FOUNDER_LEGAL_REVIEW}`,
      table: {
        headers: COOKIE_TABLE_HEADERS,
        rows: [
          ["__atuvc", "www.lotterycorner.com", "/", "First-party", "1 year",
            "This cookie is associated with the AddThis social sharing widget which is commonly embedded in "
            + "websites to enable visitors to share content with a range of networking and sharing "
            + "platforms. It stores an updated page share count."],
          ["__atuvs", "www.lotterycorner.com", "/", "First-party", "29 minutes",
            "This cookie is associated with the AddThis social sharing widget which is commonly embedded in "
            + "websites to enable visitors to share content with a range of networking and sharing "
            + "platforms. This is believed to be a new cookie from AddThis which is not yet documented, but "
            + "has been categorized on the assumption it serves a similar purpose to other cookies set by "
            + "the service."],
        ],
      },
    },
    {
      heading: `Unclassied cookies ${FOUNDER_LEGAL_REVIEW}`,
      table: {
        headers: ["Cookie key", "Domain", "Path", "Cookie type", "Expiration"],
        rows: [
          ["__stidv", ".sharethis.com", "/", "Third-party", "1 year"],
        ],
      },
    },
    {
      heading: "Third Party Cookies",
      paragraphs: [
        "A part form the above specified, there are other cookies, also known as Third party cookies which "
        + "are set by other Websites.",
        "We work with different advertising agencies that may deliver advertisements that are based on your "
        + "past browsing history and browsing habits. When these ads are being loaded, the external websites "
        + "may deliver cookies from our advertising network. You can change you preferences over these "
        + "external cookies by changing your browser settings. We dont have control over the cookies "
        + "delivered by these third party websites.",
      ],
    },
    {
      heading: "Contacting us",
      paragraphs: [
        "Contact us If you would like to contact us to understand more about this Policy or wish to contact "
        + "us concerning any matter relating to our use of cookies, you may do so via the contact form.",
      ],
    },
  ],
  /* The legacy page's own closing sentence: "This document was last updated on March 19, 2021". */
  lastUpdated: "March 19, 2021",
  provenance: {
    sourceFile:
      "00-reference-existing-project/LotteryCorner40/WebContent/WEB-INF/upgrade/cookies_policy_upgrade.jsp",
    transcriptionDate: "2026-08-12",
    note:
      "All prose sections and all five cookie-inventory tables, verbatim and in legacy order, typos "
      + "included. The legacy in-body h3 'Cookie policy' duplicated the H1 and was not repeated; the "
      + "closing last-updated sentence renders as the template's last-updated line. The InternetCookies.org "
      + "hyperlink flattens to text — a policy page links same-site only.",
  },
  reviewNotes: [
    `The meta description names Smart Picks and FREE lottery systems, legacy features the product no longer `
    + `offers. Transcribed as-is; flagged here because a marker inside a meta tag would leak into link `
    + `previews. ${FOUNDER_LEGAL_REVIEW}`,
    `The five cookie tables enumerate the LEGACY application's cookies (JSESSIONID is the JSP session `
    + `cookie; AddThis and ShareThis are retired services; the inventory is dated March 19, 2021). The new `
    + `UI sets none of these today — the inventory needs re-auditing before launch. ${FOUNDER_LEGAL_REVIEW}`,
  ],
};
