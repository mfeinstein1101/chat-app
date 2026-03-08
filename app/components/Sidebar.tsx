"use client";

import { supabase } from "../lib/supabase";

type Channel = {
  id: number;
  name: string;
};

type Props = {
  channels: Channel[];
  activeChannelId: number | null;
  onChannelSelect: (channel: Channel) => void;
};

export default function Sidebar({ channels, activeChannelId, onChannelSelect }: Props) {
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-lg font-semibold mb-4">Channels</h2>
      <ul className="flex flex-col gap-2">
        {channels.map((channel) => (
          <li
            key={channel.id}
            onClick={() => onChannelSelect(channel)}
            className={`p-2 rounded cursor-pointer ${channel.id === activeChannelId ? "bg-gray-700" : "hover:bg-gray-700"}`}
          >
            # {channel.name}
          </li>
        ))}
      </ul>
      <button
        onClick={handleSignOut}
        className="mt-auto p-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded cursor-pointer"
      >
        Sign out
      </button>
    </div>
  );
}