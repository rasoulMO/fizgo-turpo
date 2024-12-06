// src/app/partner/[appNumber]/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.log(error);
  }, [error]);

  return (
    <div className="container max-w-3xl py-10">
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-destructive text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            {error.message ||
              "You don't have permission to view this application."}
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button onClick={reset}>Try Again</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
