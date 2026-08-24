'use client';

import { useState } from 'react';

export const LoginFields = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-bold text-zinc-800"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white focus:ring-4 focus:ring-zinc-950/5"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label htmlFor="password" className="text-sm font-bold text-zinc-800">
            Password
          </label>
          <a
            href="#forgot-password"
            className="text-xs font-bold text-zinc-600 hover:text-zinc-950 hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-4 pr-16 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white focus:ring-4 focus:ring-zinc-950/5"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-0 px-4 text-xs font-bold text-zinc-500 hover:text-zinc-950"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-zinc-600">
        <input
          name="remember"
          type="checkbox"
          className="size-4 rounded border-zinc-300 accent-zinc-950"
        />
        Remember me
      </label>

      <button
        type="submit"
        className="w-full rounded-xl bg-zinc-950 px-4 py-3 font-bold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-950/20"
      >
        Log in
      </button>
    </>
  );
};

export const LoginSuccess = () => (
  <p role="status" className="text-center text-sm font-bold text-emerald-700">
    Login form submitted successfully.
  </p>
);
