"use client";

import React from "react";
import IntroGate from "@/components/IntroGate";
import Invitation from "@/components/Invitation";
import type { Guest } from "@/data/guests";

type InitialRsvp = { status: "yes" | "no"; message?: string } | null;

export default function GuestInviteClient({
  guest,
  initial,
}: {
  guest: Guest;
  initial: InitialRsvp;
}) {
  return (
    <IntroGate audioSrc="/music/music.mp3" volume={0.35}>
      <Invitation guest={guest} initial={initial} />
    </IntroGate>
  );
}
