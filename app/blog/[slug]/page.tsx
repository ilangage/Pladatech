import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopShell from "@/components/ShopShell";
import { storiesContent } from "@/data/store";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return storiesContent.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = storiesContent.find((item) => item.slug === slug);

  if (!story) {
    return {
      title: "Article | Pladatech",
    };
  }

  return {
    title: `${story.title} | Pladatech`,
    description: story.excerpt,
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const story = storiesContent.find((item) => item.slug === slug);

  if (!story) notFound();

  return (
    <ShopShell>
      <article className="subpage section-card">
        <p>
          <Link href="/">← Home</Link>
        </p>
        <span className="bundle-kicker">{story.tag}</span>
        <h1 style={{ fontSize: "clamp(2.75rem, 5vw, 4.75rem)", lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 800, margin: "10px 0 14px" }}>
          {story.title}
        </h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.65, fontWeight: 600, maxWidth: 760 }}>
          {story.date} · Pladatech guide
        </p>
        <img src={story.image} alt={story.title} width={1200} height={620} style={{ width: "100%", maxHeight: 520, objectFit: "cover", borderRadius: 28, background: "var(--soft)", margin: "28px 0" }} />
        <div style={{ display: "grid", gap: 24, maxWidth: 860, color: "var(--muted)", lineHeight: 1.7, fontWeight: 500 }}>
          <p style={{ fontSize: 18 }}>{story.excerpt}</p>
          {story.sections.map((section) => (
            <section key={section.title}>
              <h2 style={{ color: "var(--ink)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.08, letterSpacing: "-0.03em", margin: "0 0 10px", fontWeight: 700 }}>
                {section.title}
              </h2>
              <p>{section.body}</p>
            </section>
          ))}
          <p>
            Explore related products in the <Link href="/#products">Pladatech shop</Link> or contact us if you need help choosing the right item.
          </p>
        </div>
      </article>
    </ShopShell>
  );
}
