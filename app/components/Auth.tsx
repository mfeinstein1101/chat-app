"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({ id: data.user.id, username });
        if (profileError) setError(profileError.message);
      }
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-400"
        />
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-400"
          />
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white py-2 rounded-lg text-sm hover:bg-blue-600"
        >
          {isLogin ? "Sign in" : "Sign up"}
        </button>
        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-center text-gray-500 cursor-pointer hover:text-gray-800"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </p>
      </div>
    </div>
  );
}