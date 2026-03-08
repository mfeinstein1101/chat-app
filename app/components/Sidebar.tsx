"use client";

import { supabase } from "../lib/supabase";

export default function Sidebar() {
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-lg font-semibold mb-4">Conversations</h2>
      <ul className="flex flex-col gap-2">
        <li className="p-2 rounded bg-gray-700 cursor-pointer">General</li>
        <li className="p-2 rounded hover:bg-gray-700 cursor-pointer">Random</li>
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