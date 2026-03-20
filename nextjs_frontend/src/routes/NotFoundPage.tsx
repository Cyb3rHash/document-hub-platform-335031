import React from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardBody, PageHeader } from "@/components/ui";

// PUBLIC_INTERFACE
export default function NotFoundPage() {
  /** Global not-found page. */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Card>
          <PageHeader title="Page not found" subtitle="The page you’re looking for doesn’t exist or has moved." />
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">Return to the landing page or open the application workspace.</p>
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="secondary">Go to landing</Button>
              </Link>
              <Link to="/app">
                <Button>Go to app</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
