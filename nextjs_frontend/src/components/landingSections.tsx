import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faWandMagicSparkles,
  faGaugeHigh,
  faUsers,
  faKey,
  faEye,
  faFileCircleCheck,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { Badge, Button, Container } from "./ui";

const cardMotion = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 as const },
  transition: { duration: 0.45 },
};

// PUBLIC_INTERFACE
export function FeaturesSection() {
  /** Feature grid section for the landing page. */
  return (
    <section id="features" className="py-14 md:py-20">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Badge className="mb-4">
              <FontAwesomeIcon icon={faWandMagicSparkles} className="h-3.5 w-3.5 text-blue-600" />
              Built for modern document workflows
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-[2rem]">
              Everything you need to publish and manage documents.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
              Upload, view, and share content with a professional UX. Designed for teams that care about
              access control, performance, and audit signals.
            </p>
          </div>
          <Link to="/signup" className="md:pb-1">
            <Button variant="secondary">Start free</Button>
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={faGaugeHigh}
            title="Fast viewer UX"
            description="Smooth reading experience with scalable rendering and responsive layout."
          />
          <FeatureCard
            icon={faLayerGroup}
            title="Organization"
            description="Keep versions, metadata, and visibility settings consistent across your library."
          />
          <FeatureCard
            icon={faEye}
            title="Analytics-ready"
            description="View counters and events designed for dashboards and reporting."
          />
          <FeatureCard
            icon={faUsers}
            title="Sharing controls"
            description="Public, unlisted, and private options with future-proof access grants."
          />
        </div>
      </Container>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: Parameters<typeof FontAwesomeIcon>[0]["icon"];
  title: string;
  description: string;
}) {
  return (
    <motion.div {...cardMotion} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700">
          <FontAwesomeIcon icon={icon} className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// PUBLIC_INTERFACE
export function SecuritySection() {
  /** Security and controls section for the landing page. */
  return (
    <section id="security" className="py-14 md:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Badge className="mb-4">
              <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5 text-blue-600" />
              Security-first by design
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-[2rem]">
              Control visibility with confidence.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
              DocumentHub pairs a clean user experience with an authorization model designed for production.
              Set visibility per document, enable watermarking, and restrict access without friction.
            </p>

            <div className="mt-8 grid gap-3">
              <SecurityRow
                icon={faKey}
                title="Granular access"
                description="Private and shared experiences designed around user identity and future grants."
              />
              <SecurityRow
                icon={faFileCircleCheck}
                title="Watermark-ready"
                description="Support for watermarking and download controls to protect sensitive content."
              />
              <SecurityRow
                icon={faShieldHalved}
                title="RLS-compatible"
                description="Architected to work with Supabase RLS policies for strong data separation."
              />
            </div>
          </div>

          <div className="lg:col-span-6">
            <motion.div {...cardMotion} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Recommended access patterns</p>
              <p className="mt-1 text-sm text-gray-600">Choose the right visibility mode per document.</p>

              <div className="mt-5 grid gap-3">
                <ModeRow title="Private" detail="Only you (or explicit grants) can access it." />
                <ModeRow title="Unlisted" detail="Accessible by link, not discoverable by search." />
                <ModeRow title="Public" detail="Discoverable and viewable by anyone." />
              </div>

              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-600">
                  Note: Viewer and policy behaviors depend on your backend/RLS configuration.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SecurityRow({
  icon,
  title,
  description,
}: {
  icon: Parameters<typeof FontAwesomeIcon>[0]["icon"];
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gray-900 text-white">
        <FontAwesomeIcon icon={icon} className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function ModeRow({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-600">{detail}</p>
    </div>
  );
}

// PUBLIC_INTERFACE
export function PricingSection() {
  /** Lightweight pricing section with a primary CTA. */
  return (
    <section id="pricing" className="py-14 md:py-20">
      <Container>
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm md:p-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <Badge className="mb-4">
                <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5 text-blue-600" />
                Simple pricing
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-[2rem]">
                Start free. Upgrade when you need more.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
                DocumentHub is designed to scale with your organization. Begin with a secure personal library
                and add advanced controls as your needs grow.
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-6 md:w-[22rem]">
              <p className="text-sm font-semibold text-gray-900">Starter</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900">
                $0<span className="text-base font-medium text-gray-600">/mo</span>
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  Private library
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  Public/unlisted sharing
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  Viewer analytics signals
                </li>
              </ul>
              <Link to="/signup" className="mt-6 block">
                <Button className="w-full">Create account</Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
