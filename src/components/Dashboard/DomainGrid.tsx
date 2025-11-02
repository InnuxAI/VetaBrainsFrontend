import React from "react";
import type { Domain } from "../../api/documents";
import { useNavigation } from "../../hooks/useNavigation";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import {
  Shield,
  FolderOpen,
  Search,
  UploadCloud,
  Lock,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../App";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Props {
  domains: Domain[];
}

const highlights = [
  { icon: Shield, title: "Domain-scoped access", desc: "Every user sees only the domains they’re allowed to view." },
  { icon: UploadCloud, title: "Admin-curated uploads", desc: "Admins ensure consistent and approved content." },
  { icon: Search, title: "Faster discovery", desc: "Navigate instantly to relevant files and insights." },
];

const benefits = [
  { icon: Lock, title: "Security & compliance", desc: "RBAC ensures privacy, ownership, and auditability." },
  { icon: Clock, title: "Operational speed", desc: "Centralized knowledge accelerates daily workflows." },
  { icon: CheckCircle2, title: "Quality & trust", desc: "Vetted content builds confidence across teams." },
];

// Framer Motion variants
const container = (count: number) => ({
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: count > 18 ? 0.03 : 0.05,
      delayChildren: 0.04,
    },
  },
});

const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

const DomainGrid: React.FC<Props> = ({ domains }) => {
  const { goToDomain } = useNavigation();
  const { user } = useAuth();
  const prefersReduced = useReducedMotion();
  const disableAnim = prefersReduced || domains.length > 36;

  const Card: React.FC<{ domain: Domain }> = ({ domain }) => {
    const title = domain.display_name || domain.name;

    return (
      <button
        onClick={() => goToDomain(domain.name)}
        className="h-full text-left"
        aria-label={`Open ${title}`}
        title={title}
      >
        <div
          className="
            group relative w-full rounded-2xl border bg-[var(--color-card)]
            border-[var(--color-border)] p-7 shadow-md hover:shadow-lg
            hover:-translate-y-0.5 transition-transform overflow-visible
          "
        >
          {/* Corner 'New document' ribbon (absolute; does not affect layout) */}
          {domain.has_new && (
            <div
              className="
                absolute
                -top-2
                -right-2
                z-[2]
                pointer-events-none
              "
              aria-hidden="true"
            >
              <div
                className="
                  inline-flex items-center gap-1
                  px-2 py-1
                  rounded-md
                  text-[10px] font-semibold
                  bg-[var(--color-accent)]
                  text-[var(--color-accent-foreground)]
                  shadow
                  border border-[var(--color-border)]
                  translate-x-[10%] translate-y-[-10%]
                "
                style={{ clipPath: "inset(0 round 0.5rem)" }}
              >
                New document
              </div>
            </div>
          )}

          <div className="flex flex-col h-full justify-between">
            {/* Header: fixed min-height ensures uniform card height */}
            <div className="flex items-start justify-between min-h-[52px]">
              <div className="min-w-0">
                <div className="text-xs uppercase text-[var(--muted-foreground)]">
                  Domain
                </div>
                <div className="mt-1 font-semibold text-lg text-[var(--color-foreground)] truncate">
                  {title}
                </div>
              </div>

              <div
                className="
                  h-12 w-12 rounded-xl flex items-center justify-center
                  bg-[var(--color-primary)] text-[var(--color-primary-foreground)]
                  shadow shrink-0
                "
              >
                {domain.icon ? (
                  <img
                    src={domain.icon}
                    alt={`${domain.name} icon`}
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <FolderOpen className="h-6 w-6" />
                )}
              </div>
            </div>

            {/* Body */}
            <p className="mt-3 text-sm text-[var(--muted-foreground)] line-clamp-3">
              Explore curated resources and files maintained by your administrators.
            </p>

            {/* Footer progress accent */}
            <div className="mt-5 h-1.5 rounded-full bg-[var(--color-muted)] overflow-hidden">
              <div
                className="
                  h-full w-0 group-hover:w-full transition-[width] duration-600
                  bg-[var(--color-primary)]
                "
              />
            </div>
          </div>
        </div>
      </button>
    );
  };

  const Empty = (
    <div
      className="
        min-h-[300px] border border-dashed rounded-xl flex items-center justify-center text-center
        border-[var(--color-border)] text-[var(--muted-foreground)] bg-[var(--color-card)]
      "
    >
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
          No domains available
        </h3>
        <p className="text-sm mt-1">
          {user?.role === "admin"
            ? "Create a domain to get started."
            : "Your administrator can grant access to relevant domains."}
        </p>
      </div>
    </div>
  );

  const Grid = disableAnim ? (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
      {domains.map((d) => (
        <div key={d.id} className="h-full">
          <Card domain={d} />
        </div>
      ))}
    </div>
  ) : (
    <motion.div
      variants={container(domains.length)}
      initial="hidden"
      animate="show"
      className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr"
    >
      {domains.map((d) => (
        <motion.div key={d.id} variants={item} className="h-full will-change-transform">
          <Card domain={d} />
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="
          w-full min-h-screen p-40
          bg-[var(--color-background)] text-[var(--color-foreground)] font-[var(--font-sans)]
        "
      >
        {user?.role === "admin" ? (
          domains.length === 0 ? Empty : Grid
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left marketing/benefits column */}
            <motion.section
              initial={disableAnim ? undefined : { opacity: 0, y: 8 }}
              animate={disableAnim ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
              <div className="absolute -top-8 -left-10 w-[500px] h-[300px] bg-[var(--color-accent)] blur-3xl rounded-full opacity-40 pointer-events-none" />
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-[var(--color-foreground)]">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--chart-1)] via-[var(--chart-2)] to-[var(--chart-3)]">
                  VetaBrains
                </span>
              </h1>
              <p className="mt-4 text-[var(--muted-foreground)] text-base max-w-prose">
                A centralized, permission-aware hub where admins manage content and users access
                exactly what they need—nothing more, nothing less.
              </p>

              <div className="mt-5 flex gap-2">
                <Badge variant="secondary">Secure</Badge>
                <Badge variant="secondary">Curated</Badge>
                <Badge variant="secondary">Fast</Badge>
              </div>

              <Separator className="my-6 bg-[var(--color-border)]" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {highlights.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div
                      className="
                        h-10 w-10 rounded-xl flex items-center justify-center
                        bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow
                      "
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--color-foreground)]">{title}</div>
                      <div className="text-sm text-[var(--muted-foreground)]">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold text-[var(--color-foreground)]">
                  Why teams love this portal
                </h2>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Designed for clarity, speed, and governance—publish confidently and find answers fast.
                </p>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {benefits.map(({ icon: Icon, title, desc }) => (
                    <div key={title}>
                      <div className="flex items-center gap-2 text-[var(--color-foreground)]">
                        <Icon className="h-4 w-4 text-[var(--color-primary)]" />
                        <span className="font-semibold text-sm">{title}</span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center text-sm text-[var(--muted-foreground)]">
                <ChevronRight className="h-4 w-4 mr-1 text-[var(--color-primary)]" />
                Choose a domain on the right to explore its documents.
              </div>
            </motion.section>

            {/* Right grid */}
            <div className="lg:col-span-7">{domains.length === 0 ? Empty : Grid}</div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
};

export default DomainGrid;
