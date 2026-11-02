import React from "react";
import { Composition } from "remotion";
import { HeroLoop } from "./compositions/HeroLoop";
import { TitleReveal } from "./compositions/TitleReveal";
import { Milestones, milestonesDuration } from "./compositions/Milestones";
import { FlowScrub } from "./compositions/FlowScrub";
import { GuestFilm, GUEST_FILM } from "../../components/film/GuestFilm";

const FPS = 30;

// Ids double as output names: public/videos/<id>.mp4 (see render-all.mjs).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="hero-loop" component={HeroLoop} durationInFrames={10 * FPS} fps={FPS} width={1920} height={1080} />
    <Composition id="hero-loop-vertical" component={HeroLoop} durationInFrames={10 * FPS} fps={FPS} width={1080} height={1920} />
    <Composition id="title-20" component={TitleReveal} durationInFrames={8 * FPS} fps={FPS} width={1920} height={1080} />
    <Composition id="flow-scrub" component={FlowScrub} durationInFrames={6 * FPS} fps={FPS} width={1600} height={900} />
    <Composition id="flow-scrub-vertical" component={FlowScrub} durationInFrames={6 * FPS} fps={FPS} width={720} height={1280} />
    <Composition
      id="guest-film"
      component={GuestFilm}
      {...GUEST_FILM}
      defaultProps={{ name: "Б.Одсүрэн", vip: true, dateLabel: "2026.12.04 · 18:00" }}
    />
    <Composition id="milestones" component={Milestones} durationInFrames={milestonesDuration(FPS)} fps={FPS} width={1920} height={1080} />
  </>
);
