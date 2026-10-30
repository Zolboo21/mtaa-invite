import { notFound } from 'next/navigation';
import { findGuest } from '@/data/guests';
import { getRsvp } from '@/lib/store';
import GuestInviteClient from "@/components/GuestInviteClient";

export const dynamic = 'force-dynamic';

export default async function GuestInvitePage({
                                                  params,
                                              }: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const guest = findGuest(slug);
    if (!guest) notFound();

    const existing = await getRsvp(guest.slug);
    const initial = existing
        ? { status: existing.status, message: existing.message }
        : null;

    return <GuestInviteClient guest={guest} initial={initial} />;
}