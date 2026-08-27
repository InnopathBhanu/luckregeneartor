/*
 * S-14 Community · S-15 News · S-16 Follow State · S-17 Sources & Responsible Play ·
 * S-18 All States, plus the suppressed-section notes for S-09 … S-13.
 *
 * Task LRG-STATE-021 §8. Authority: PF-02 §4 (S-14/S-15 required hubs that may begin sparse), §27
 * (cold start, never fabricate), §29, §30, §31; FD-S-02 (suppression), FD-S-30 (registry, no `/usx`),
 * APP-ST-04/05 (a cold-start shell is not an advertising host).
 */

import { section, type StateSectionId } from "@/lib/state/sectionManifest";
import type { StatePreviewModel } from "@/lib/state/statePreviewModel";
import { SuppressionNote } from "./StateCommon";
import StateRememberDevice from "../StateRememberDevice";

/*
 * S-14 MOVED — LRG-STATE-034 §6.
 *
 * The community module is now `sections/StateCommunity.tsx`. It was a one-paragraph empty notice here; it is
 * a real landing-page engagement module there, with the researched discussion areas and genuine cold-start
 * actions. Kept out of this file because this file holds ROUTED SUMMARIES, and community is not one.
 */





/** The recorded suppressions for S-09 … S-13, shown in the guarded preview so a reviewer sees the why. */
export function SuppressedSectionNotes({ model }: { model: StatePreviewModel }) {
  const ids: StateSectionId[] = ["S-04", "S-09", "S-10", "S-11", "S-12", "S-13"];
  const notes = ids
    .map((id) => ({ id, s: model.sectionState[id] }))
    .filter((x) => x.s && x.s.render === false);
  if (notes.length === 0) return null;
  return (
    <section
      className="lcs-section"
      aria-labelledby="suppressed-heading"
      data-section-id="preview-suppressions"
    >
      <h2 className="lcs-h2" id="suppressed-heading">
        Sections suppressed in this preview
      </h2>
      <p className="lcs-lede">
        PF-02 requires every conditional module to record why it is shown or suppressed. These
        {" "}{notes.length} sections have no verifiable data, so they render nothing rather than an empty
        shell or invented content.
      </p>
      {notes.map(({ id, s }) =>
        s.render === false ? <SuppressionNote key={id} id={id} reason={s.reason} /> : null,
      )}
    </section>
  );
}
