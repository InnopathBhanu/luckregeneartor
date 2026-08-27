# LotteryCorner Community Profile and Reputation Blueprint — Final Approved

**Document:** `08C-lotterycorner-community-profile-and-reputation-blueprint-FINAL-APPROVED.md`  
**Version:** 1.0  
**Status:** Final approved and frozen  
**Canonical route:** `/members/{username}`

---

## 1. Identity

Members may participate using a username.

Real name is optional.

No real-name requirement for ordinary forum participation.

---

## 2. Public Profile

May show:

- username;
- optional display name;
- avatar;
- joined date;
- short bio;
- selected state/game interests;
- public Forum Entries;
- public replies;
- helpful/accepted replies;
- systems;
- number shares;
- contribution labels;
- followed public topics where user allows.

---

## 3. Private Profile Data

Never public by default:

- email;
- phone;
- precise address;
- private number sets;
- purchased tickets;
- payment/purchase data;
- moderation evidence;
- account security information.

---

## 4. Public Labels

Initial labels:

- Helpful Contributor;
- State Regular;
- Game Expert;
- System Contributor;
- Reporter;
- Moderator;
- LotteryCorner Research;
- Winner Story Reviewed.

A badge states what was reviewed or earned.

No broad “Verified Winner” without documented verification.

---

## 5. Reputation Signals

Internal:

- helpful reply;
- accepted reply;
- source supplied;
- constructive depth;
- account age;
- state/game specialization;
- system documentation;
- moderation history;
- verified story contribution.

No single visible points score at launch.

---

## 6. Follow

Members may follow a contributor.

Controls:

- new Forum Entry;
- replies;
- systems only;
- number shares only;
- daily/weekly digest;
- mute/unfollow.

---

## 7. Profile Indexability

States:

```text
INDEX_PENDING
INDEX_ELIGIBLE
INDEXED
NOINDEX_PRIVATE
NOINDEX_LOW_VALUE
NOINDEX_MODERATED
REMOVED
```

Index eligibility requires:

- public profile;
- visible stable username;
- genuine activity;
- original contributions;
- moderation clearance;
- useful public content.

Empty profiles remain noindex.

---

## 8. Profile Schema

```text
ProfilePage
mainEntity: Person
```

Recommended fields:

```text
@id
url
name
alternateName
image
description
identifier
interactionStatistic
sameAs
```

Rules:

- username may be `alternateName` or primary visible identity;
- image only when genuine;
- statistics only when accurate and visible;
- `sameAs` only for verified user-provided profiles;
- removed/private profiles do not retain misleading schema.

---

## 9. Account Deletion

When permitted:

- remove private information;
- remove/noindex profile;
- anonymize retained public contributions;
- preserve thread continuity and moderation/correction history;
- show neutral deleted-user state;
- remove stale ProfilePage markup.

---

## 10. Safety

Profiles include:

- report;
- block;
- mute;
- moderation status where necessary;
- scam warnings;
- no direct payment solicitation.

No unrestricted private messaging at launch.

---

## 11. Reporter Profiles

News reporters continue to use:

```text
/authors/{reporter-slug}
```

Community membership may link to the reporter identity but does not replace the author profile.

---

## 12. Measurement

- profile views;
- follow;
- contribution continuation;
- helpful replies;
- return visits;
- report/block;
- profile index eligibility;
- contributor retention.

This blueprint is approved and frozen as Version 1.0.
