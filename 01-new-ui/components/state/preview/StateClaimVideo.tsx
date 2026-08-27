"use client";

/*
 * THE LOTTERYCORNER CLAIM VIDEO — LRG-STATE-048.
 *
 * One compact block inside the claim-and-help area. Deliberately small: it is supporting content, not a
 * feature, and the task is explicit that it must not be a hero, a modal, a sticky player or an autoplay.
 *
 * ══ CLICK TO LOAD, AND WHY ══
 *
 * Nothing from YouTube is requested until the reader asks for it. A bare `<iframe>` contacts Google on page
 * load for every visitor who never watches, which is a third-party request the consent posture in CLAUDE.md
 * §12 does not cover — partner scripts stay inert by default, and an embed is a partner script wearing an
 * iframe. So the block renders a poster button first and mounts the iframe on click, using the
 * PRIVACY-ENHANCED `youtube-nocookie.com` host when it does.
 *
 * No thumbnail image is fetched either. YouTube's thumbnail CDN is the same third party, and no thumbnail
 * URL is recorded for these videos anyway — so the poster is typography, not an unverified image.
 *
 * ══ WHAT THIS BLOCK MUST NEVER DO ══
 *
 * State a claim threshold, a deadline or a prize amount. The video is LotteryCorner content we own; the
 * rules spoken inside it are governed facts owned by the manifest, and for these four States the manifest
 * records them as unresearched. The configuration validator refuses a title or description containing a
 * money figure or a day/month/year count, so the split cannot erode by editing copy.
 *
 * The standing disclaimer is required by the task and is shown whether or not the reader plays the video.
 */

import { useState } from "react";
import type { StateClaimVideo } from "@/lib/state/stateLowerPageContent";

export default function StateClaimVideoBlock({
  video,
  stateName,
}: {
  video: StateClaimVideo;
  stateName: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <section
      className="lcs-vid"
      aria-labelledby="claim-video-heading"
      data-claim-video={video.videoId}
      data-video-autoplay="false"
      data-video-modal="false"
    >
      <h3 className="lcs-h4" id="claim-video-heading">{video.title}</h3>
      <p className="lcs-vid__owner">
        {/* Visible ownership, per the task. It is our video, and the reader should be able to see that
            without hovering a link. */}
        <span className="lcs-vid__badge">{video.ownerLabel}</span>
      </p>
      <p className="lcs-vid__desc">{video.description}</p>

      <div className="lcs-vid__frame">
        {playing ? (
          <iframe
            className="lcs-vid__player"
            /* `?rel=0` keeps the end screen to this channel. No `autoplay`, deliberately: the reader
               already clicked once, and a second surprise is what the no-autoplay rule is about. */
            src={`${video.embedUrl}?rel=0`}
            title={video.title}
            /* `allow` deliberately omits `autoplay`. */
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="lcs-vid__poster"
            onClick={() => setPlaying(true)}
            data-video-load="click"
          >
            <span className="lcs-vid__play" aria-hidden="true">▶</span>
            <span className="lcs-vid__posterlabel">
              Play video
              {/* The accessible name says what will happen, because loading a third-party player is not
                  what a bare "Play" button usually implies. */}
              <span className="lcs-vh"> — {video.title}. Loads the YouTube player.</span>
            </span>
          </button>
        )}
      </div>

      <p className="lcs-vid__fine">
        {/* Required wording, verbatim. Shown whether or not the video has been played. */}
        Claim rules can change. Confirm current requirements before claiming.
      </p>
      <p className="lcs-vid__fine">
        <a
          className="lcs-vid__fallback"
          href={video.watchUrl}
          rel="noopener noreferrer external"
          target="_blank"
        >
          Watch on YouTube
          <span className="lcs-vid__mark" aria-hidden="true">↗</span>
          <span className="lcs-vh"> (opens {stateName} claim video on YouTube in a new tab)</span>
        </a>
      </p>
    </section>
  );
}
