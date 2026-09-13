"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="system-state-page">
      <span className="eyebrow">Temporary interruption</span>
      <h1>We couldn&apos;t load your workspace.</h1>
      <p>
        Your progress is safe. Try again, and contact Hari if this keeps
        happening.
      </p>
      <button className="primary-button" onClick={retry}>
        Try again
      </button>
      {error.digest && <small>Reference: {error.digest}</small>}
    </main>
  );
}
