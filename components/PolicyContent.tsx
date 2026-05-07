import type { PolicyPage } from "@/data/policy-pages";

export default function PolicyContent({ policy }: { policy: PolicyPage }) {
  return (
    <div className="policy-content">
      <span>{policy.eyebrow}</span>
      <h1>{policy.title}</h1>
      <p className="policy-updated">{policy.updated}</p>
      <p className="policy-intro">{policy.intro}</p>
      <div className="policy-sections">
        {policy.sections.map((section) => (
          <section key={section.title} className="policy-section">
            <h2>{section.title}</h2>
            <p>{section.body}</p>
            {section.items?.length ? (
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
