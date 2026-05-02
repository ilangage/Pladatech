"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  announcementBar,
  bestSellersSection,
  brandMarqueeItems,
  bundles,
  categoryList,
  collections,
  collectionsSection,
  contactFormTopics,
  demoReviews,
  faqs,
  finalCta,
  getProductsBySlugs,
  heroSlides,
  lookbookContent,
  megaMenu,
  navItems,
  problemSolution,
  promoPopup,
  quickOrderSection,
  shopFeedHeading,
  storiesContent,
  trustRowItems,
  whyShopSection,
  categories,
  products,
  type Category,
  type Product,
} from "@/data/store";
import { useCart, type CartLine } from "@/components/cart-context";
import { Icon, Logo, formatPrice, ShopFooter } from "@/components/shop-shared";

const price = formatPrice;
type SortMode = "featured" | "price-low" | "price-high" | "rating";

function useCountdown() {
  const [left, setLeft] = useState({ days: 259, hours: 1, mins: 11, secs: 5 });
  useEffect(() => {
    const target = Date.now() + ((259 * 24 + 1) * 60 * 60 + 11 * 60 + 5) * 1000;
    const timer = setInterval(() => {
      const ms = Math.max(0, target - Date.now());
      setLeft({
        days: Math.floor(ms / 86400000),
        hours: Math.floor((ms / 3600000) % 24),
        mins: Math.floor((ms / 60000) % 60),
        secs: Math.floor((ms / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return left;
}

export default function Storefront() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const {
    cart,
    cartOpen,
    setCartOpen,
    addToCart,
    updateQty,
    subtotal,
    totalItems,
    giftWrap,
    setGiftWrap,
    cartNote,
    setCartNote,
    checkout,
  } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [recentIds, setRecentIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewIndex, setReviewIndex] = useState(0);
  const countdown = useCountdown();

  useEffect(() => {
    const timer = setTimeout(() => setPromoOpen(true), 1600);
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("recent-products") : null;
    if (stored) setRecentIds(JSON.parse(stored));
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setReviewIndex((i) => (i + 1) % demoReviews.length), 6000);
    return () => clearInterval(id);
  }, []);

  const openQuickView = (product: Product) => {
    setQuickView(product);
    setRecentIds((current) => {
      const next = [product.id, ...current.filter((id) => id !== product.id)].slice(0, 4);
      if (typeof window !== "undefined") window.localStorage.setItem("recent-products", JSON.stringify(next));
      return next;
    });
  };

  const visibleProducts = useMemo(() => {
    let list = selectedCategory === "All" ? products : products.filter((product) => product.category === selectedCategory);
    if (sortMode === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    if (sortMode === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    if (sortMode === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [selectedCategory, sortMode]);

  const searchResults = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return products.slice(0, 4);
    return products
      .filter((product) =>
        `${product.title} ${product.category} ${product.brand} ${product.tags.join(" ")}`.toLowerCase().includes(term),
      )
      .slice(0, 6);
  }, [searchTerm]);

  const recentProducts = recentIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];
  const recommendedSlice = useMemo(
    () => getProductsBySlugs(["front-rear-dash-cam-bundle", "robot-vacuum-mop-combo", "dual-zone-air-fryer", "massage-gun"]),
    [],
  );

  return (
    <main className="page-shell">
      <div className="store-card" id="top">
        <div className="announcement-bar" role="region" aria-label="Store announcement">
          {announcementBar}
        </div>
        <Header
          cartCount={totalItems}
          accountOpen={accountOpen}
          setAccountOpen={setAccountOpen}
          setSearchOpen={setSearchOpen}
          setCartOpen={setCartOpen}
          megaOpen={megaOpen}
          setMegaOpen={setMegaOpen}
          mobileMenu={mobileMenu}
          setMobileMenu={setMobileMenu}
        />

        <SocialRail />

        <section className="shop-feed section-card">
          <div className="section-heading inline-heading">
            <div>
              <h1>
                {shopFeedHeading.title} <span className="scribble">⌁</span>
              </h1>
              <p>{shopFeedHeading.subtitle}</p>
            </div>
            <div className="profile-badge">
              <div className="avatar-ring">
                <Logo />
              </div>
              <div>
                <strong>{shopFeedHeading.profileHandle}</strong>
                <button type="button">Follow</button>
              </div>
            </div>
          </div>
          <div className="feed-grid">
            {categoryList.map((cat, index) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} className="feed-card" style={{ display: "block", color: "inherit" }}>
                <img src={cat.image} alt={cat.name} />
                <span>
                  <Icon name="instagram" size={23} />
                </span>
                {index === 2 && (
                  <div className="mini-products">
                    {getProductsBySlugs(["robot-vacuum-mop-combo", "dual-zone-air-fryer"]).map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openQuickView(p);
                        }}
                        aria-label={p.title}
                      >
                        <img src={p.image} alt="" width={42} height={42} style={{ borderRadius: 10, objectFit: "cover" }} />
                      </button>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>

        <HeroBanner countdown={countdown} />
        <LookbookSection
          openQuickView={openQuickView}
          addToCart={addToCart}
          featured={products.find((p) => p.slug === "robot-vacuum-mop-combo")!}
          secondary={products.find((p) => p.slug === "portable-spot-carpet-cleaner")!}
        />
        <Testimonials reviewIndex={reviewIndex} setReviewIndex={setReviewIndex} />
        <BestSellers
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortMode={sortMode}
          setSortMode={setSortMode}
          products={visibleProducts}
          openQuickView={openQuickView}
          addToCart={addToCart}
        />
        <TrustBadges />
        <ProblemSolutionSection openQuickView={openQuickView} />
        <CollectionsStrip />
        <BundlesSection addToCart={addToCart} />
        <BrandMarquee />
        <Stories />
        <WhyShopSection />
        <FAQAndContact />
        {recentProducts.length > 0 && <Recommended title="Recently viewed" products={recentProducts} openQuickView={openQuickView} addToCart={addToCart} />}
        <Recommended title="You may also like" products={recommendedSlice} openQuickView={openQuickView} addToCart={addToCart} />
        <FinalCtaSection />
        <ShopFooter />
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        updateQty={updateQty}
        subtotal={subtotal}
        giftWrap={giftWrap}
        setGiftWrap={setGiftWrap}
        cartNote={cartNote}
        setCartNote={setCartNote}
        checkout={checkout}
      />

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} searchTerm={searchTerm} setSearchTerm={setSearchTerm} results={searchResults} openQuickView={openQuickView} />
      <QuickView product={quickView} onClose={() => setQuickView(null)} addToCart={addToCart} openProduct={openQuickView} />
      <PromoPopup open={promoOpen} onClose={() => setPromoOpen(false)} />
      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
    </main>
  );
}

function Header({ cartCount, accountOpen, setAccountOpen, setSearchOpen, setCartOpen, megaOpen, setMegaOpen, mobileMenu, setMobileMenu }: {
  cartCount: number;
  accountOpen: boolean;
  setAccountOpen: (value: boolean) => void;
  setSearchOpen: (value: boolean) => void;
  setCartOpen: (value: boolean) => void;
  megaOpen: boolean;
  setMegaOpen: (value: boolean) => void;
  mobileMenu: boolean;
  setMobileMenu: (value: boolean) => void;
}) {
  return (
    <header className="site-header">
      <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}><Icon name="menu" /></button>
      <Link href="/" onClick={() => setMobileMenu(false)}>
        <Logo />
      </Link>
      <nav className={mobileMenu ? "open" : ""}>
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onMouseEnter={() => item.label === "Shop" && setMegaOpen(true)}
            onClick={() => setMobileMenu(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <button aria-label="Search" onClick={() => setSearchOpen(true)}><Icon name="search" /></button>
        <div className="account-wrap">
          <button aria-label="Account" onClick={() => setAccountOpen(!accountOpen)}><Icon name="user" /></button>
          {accountOpen && (
            <div className="account-menu">
              <strong>Customer account</strong>
              <p>Sign in to view orders, addresses and saved products.</p>
              <button type="button">Sign in with Shop</button>
            </div>
          )}
        </div>
        <button className="cart-button" aria-label="Cart" onClick={() => setCartOpen(true)}><Icon name="cart" />{cartCount > 0 && <span>{cartCount}</span>}</button>
      </div>
      {megaOpen && <MegaMenu onClose={() => setMegaOpen(false)} />}
    </header>
  );
}

function MegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="mega-menu" onMouseLeave={onClose}>
      <div>
        <h3>{megaMenu.collectionsTitle}</h3>
        {collections.map((c) => (
          <Link key={c.slug} href={`/collections/${c.slug}`}>
            {c.name}
          </Link>
        ))}
      </div>
      <div>
        <h3>{megaMenu.shopByNeedTitle}</h3>
        {megaMenu.needLinks.map((l) => (
          <Link key={l.label} href={l.href}>
            {l.label}
          </Link>
        ))}
      </div>
      <div className="mega-promo">
        <span>{megaMenu.promoEyebrow}</span>
        <strong>{megaMenu.promoTitle}</strong>
        <p>{megaMenu.promoCopy}</p>
        <Link href={megaMenu.promoHref} className="pill-button" style={{ display: "inline-flex", marginTop: 8 }}>
          {megaMenu.promoCta}
          <Icon name="arrow" size={18} />
        </Link>
      </div>
    </div>
  );
}

function SocialRail() {
  return (
    <aside className="social-rail">
      <a><Icon name="facebook" size={22} /></a>
      <a><Icon name="x" size={20} /></a>
      <a><Icon name="instagram" size={21} /></a>
      <a><Icon name="youtube" size={22} /></a>
      <button>GET 20% OFF</button>
    </aside>
  );
}

function HeroBanner({ countdown }: { countdown: { days: number; hours: number; mins: number; secs: number } }) {
  const slide = heroSlides[0];
  return (
    <section className="hero-banner section-card" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.15)), url(${slide.image})` }}>
      <div className="hero-content">
        <p>{slide.eyebrow}</p>
        <h2>{slide.title}</h2>
        {"subheadline" in slide && slide.subheadline ? <p className="hero-sub">{slide.subheadline}</p> : null}
        <div className="countdown" aria-label="Sale countdown">
          <TimeBox value={countdown.days} label="DAYS" />
          <span>:</span>
          <TimeBox value={countdown.hours} label="HOUR" />
          <span>:</span>
          <TimeBox value={countdown.mins} label="MINS" />
          <span>:</span>
          <TimeBox value={countdown.secs} label="SECS" />
        </div>
        <div className="hero-actions">
          <Link href={slide.primaryHref} className="pill-button">
            {slide.primaryCta}
            <Icon name="arrow" size={18} />
          </Link>
          <Link href={slide.secondaryHref} className="outline-button hero-outline">
            {slide.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return <div><strong>{String(value).padStart(2, "0")}</strong><small>{label}</small></div>;
}

function LookbookSection({
  openQuickView,
  addToCart,
  featured,
  secondary,
}: {
  openQuickView: (product: Product) => void;
  addToCart: (product: Product) => void;
  featured: Product;
  secondary: Product;
}) {
  return (
    <section className="lookbook section-card">
      <div className="section-heading centered">
        <span>{lookbookContent.kicker}</span>
        <h2>
          {lookbookContent.title} <span className="scribble">⌁</span>
        </h2>
      </div>
      <div className="lookbook-grid">
        <div className="room-scene">
          <img src={lookbookContent.roomImage} alt="Pladatech lifestyle room" />
          <button className="hotspot one" onClick={() => openQuickView(featured)} aria-label={`View ${featured.title}`} />
          <button className="hotspot two" onClick={() => openQuickView(secondary)} aria-label={`View ${secondary.title}`} />
          <div className="hotspot-card card-one">
            <img src={featured.image} alt="" />
            <div>
              <strong>{featured.title}</strong>
              <small>{price(featured.price)}</small>
            </div>
          </div>
          <div className="hotspot-card card-two">
            <img src={secondary.image} alt="" />
            <div>
              <strong>{secondary.title}</strong>
              <small>{price(secondary.price)}</small>
            </div>
          </div>
        </div>
        <article className="featured-product-card">
          <button className="icon-float" onClick={() => openQuickView(featured)} type="button">
            <Icon name="eye" />
          </button>
          <img src={featured.image} alt={featured.title} />
          <div className="slider-dots">
            <span className="active" />
            <span />
            <span />
          </div>
          <small>{featured.brand}</small>
          <h3>{featured.title}</h3>
          <strong>{price(featured.price)}</strong>
          <button className="dark-button" type="button" onClick={() => addToCart(featured)}>
            {featured.preorder ? "Pre-order" : "Choose options"}
          </button>
        </article>
      </div>
    </section>
  );
}

function Testimonials({
  reviewIndex,
  setReviewIndex,
}: {
  reviewIndex: number;
  setReviewIndex: (n: number) => void;
}) {
  const r = demoReviews[reviewIndex];
  return (
    <section className="testimonial section-card">
      <div className="quote-mark">“</div>
      <h2>{r.text}</h2>
      <p>
        — {r.name} · {r.rating}/5
      </p>
      <div className="slider-dots testimonial-dots">
        {demoReviews.map((_, i) => (
          <button key={i} type="button" className={i === reviewIndex ? "active" : ""} aria-label={`Show review ${i + 1}`} onClick={() => setReviewIndex(i)} />
        ))}
      </div>
    </section>
  );
}

function BestSellers({ selectedCategory, setSelectedCategory, sortMode, setSortMode, products, openQuickView, addToCart }: {
  selectedCategory: Category | "All";
  setSelectedCategory: (value: Category | "All") => void;
  sortMode: SortMode;
  setSortMode: (value: SortMode) => void;
  products: Product[];
  openQuickView: (product: Product) => void;
  addToCart: (product: Product) => void;
}) {
  return (
    <section className="products-section section-card" id="products">
      <div className="section-heading row-heading">
        <div>
          <span>{bestSellersSection.kicker}</span>
          <h2>{bestSellersSection.title}</h2>
        </div>
        <div className="sort-wrap">
          <label>Sort</label>
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to high</option>
            <option value="price-high">Price: High to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>
      <div className="category-pills">
        <button className={selectedCategory === "All" ? "active" : ""} onClick={() => setSelectedCategory("All")}>All</button>
        {categories.map((category) => <button key={category} className={selectedCategory === category ? "active" : ""} onClick={() => setSelectedCategory(category)}>{category}</button>)}
      </div>
      <div className="product-carousel">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} openQuickView={openQuickView} addToCart={addToCart} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product, openQuickView, addToCart }: { product: Product; openQuickView: (product: Product) => void; addToCart: (product: Product) => void }) {
  return (
    <article className="product-card">
      {product.badge && <span className={`badge ${product.badgeKey}`}>{product.badge}</span>}
      <button type="button" className="quick-view" onClick={() => openQuickView(product)}><Icon name="eye" size={19} /></button>
      <div className="image-rollover" onClick={() => openQuickView(product)} role="presentation">
        <img className="main-img" src={product.image} alt={product.title} />
        <img className="hover-img" src={product.hoverImage} alt="" />
      </div>
      <div className="rating">
        <Icon name="star" size={15} /> {product.rating.toFixed(1)}
        <span className="review-count"> ({product.reviewCount})</span>
      </div>
      <small>{product.brand}</small>
      <div className="product-title-row">
        <h3>
          <Link href={`/products/${product.slug}`} onClick={(e) => e.stopPropagation()}>
            {product.title}
          </Link>
        </h3>
        <strong>{price(product.price)}</strong>
      </div>
      <ColorSwatches colors={product.colors} />
      <p className="stock-counter">Only {product.stock} left in stock</p>
      <div className="spec-grid">
        {product.specs.map((spec) => <div key={spec.label}><strong>{spec.value}</strong><span>{spec.label}</span></div>)}
      </div>
      <div className="card-actions">
        <button type="button" className="dark-button" onClick={() => addToCart(product)}>{product.preorder ? "Pre-order" : "Quick buy"}</button>
        <button type="button" className="soft-button"><Icon name="heart" size={18} /></button>
      </div>
    </article>
  );
}

function ColorSwatches({ colors, onPick, selected }: { colors: string[]; onPick?: (color: string) => void; selected?: string }) {
  return (
    <div className="swatches">
      {colors.map((color) => <button key={color} className={selected === color ? "active" : ""} onClick={() => onPick?.(color)} style={{ background: color }} aria-label={`Color ${color}`} />)}
    </div>
  );
}

function TrustBadges() {
  return (
    <section className="trust-row trust-row-wide" id="features">
      {trustRowItems.map((item) => (
        <article key={item.title}>
          <Icon name={item.icon} />
          <div>
            <strong>{item.title}</strong>
            <span>{item.copy}</span>
          </div>
        </article>
      ))}
    </section>
  );
}

function ProblemSolutionSection({ openQuickView }: { openQuickView: (product: Product) => void }) {
  return (
    <section className="stories section-card" id="problem-solution">
      <div className="section-heading row-heading">
        <h2>{problemSolution.title}</h2>
      </div>
      <div className="story-grid">
        {problemSolution.blocks.map((block) => (
          <article className="story-card" key={block.question}>
            <div className="story-image problem-block-image" style={{ height: 220 }}>
              <span>{block.question}</span>
            </div>
            <h3>Recommended</h3>
            <div className="problem-recs">
              {getProductsBySlugs(block.productSlugs).map((p) => (
                <button type="button" key={p.id} className="problem-rec" onClick={() => openQuickView(p)}>
                  <img src={p.image} alt="" width={48} height={48} />
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CollectionsStrip() {
  return (
    <section className="quick-order section-card">
      <div className="section-heading row-heading">
        <div>
          <span>{collectionsSection.subtitle}</span>
          <h2>{collectionsSection.title}</h2>
        </div>
      </div>
      <div className="quick-table">
        {collections.map((c) => (
          <Link href={`/collections/${c.slug}`} key={c.slug} className="quick-row collection-row">
            <img src={c.image} alt="" width={74} height={74} />
            <div>
              <strong>{c.name}</strong>
              <span>{c.description}</span>
            </div>
            <span className="collection-chev">View</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BundlesSection({ addToCart }: { addToCart: (product: Product, quantity?: number) => void }) {
  return (
    <section className="quick-order section-card" id="bundles">
      <div className="section-heading row-heading">
        <div>
          <span>{quickOrderSection.kicker}</span>
          <h2>{quickOrderSection.title}</h2>
        </div>
      </div>
      <div className="quick-table">
        {bundles.map((b) => {
          const items = getProductsBySlugs(b.productSlugs);
          return (
            <div className="quick-row" key={b.slug}>
              <img src={b.image} alt="" width={74} height={74} />
              <div>
                <strong>{b.name}</strong>
                <span>{b.description}</span>
              </div>
              <b>{price(b.price)}</b>
              <Link href={`/bundles/${b.slug}`} className="outline-button" style={{ padding: "10px 16px", fontSize: 14 }}>
                Details
              </Link>
              <button
                type="button"
                className="dark-button"
                onClick={() => items.forEach((p) => addToCart(p, 1))}
              >
                Add bundle
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WhyShopSection() {
  return (
    <section className="why-shop section-card">
      <div className="section-heading centered">
        <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)" }}>{whyShopSection.title}</h2>
      </div>
      <ul className="why-shop-list">
        {whyShopSection.points.map((pt) => (
          <li key={pt}>
            <Icon name="star" size={18} />
            {pt}
          </li>
        ))}
      </ul>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="testimonial section-card" style={{ paddingTop: 60, paddingBottom: 60 }}>
      <h2 style={{ marginBottom: 16 }}>{finalCta.headline}</h2>
      <p style={{ color: "var(--muted)", maxWidth: 720, margin: "0 auto 28px" }}>{finalCta.subheadline}</p>
      <Link href={finalCta.href} className="pill-button">
        {finalCta.cta}
        <Icon name="arrow" size={18} />
      </Link>
    </section>
  );
}

function BrandMarquee() {
  return (
    <section className="brand-marquee">
      <div>{[...brandMarqueeItems, ...brandMarqueeItems].map((brand, index) => <strong key={`${brand}-${index}`}>{brand}</strong>)}</div>
    </section>
  );
}

function Stories() {
  return (
    <section className="stories section-card">
      <div className="section-heading row-heading">
        <h2>Latest Stories</h2>
        <button type="button" className="outline-button">
          View all
        </button>
      </div>
      <div className="story-grid">
        {storiesContent.map((story, index) => (
          <article className={index === 0 ? "story-card large" : "story-card"} key={story.title}>
            <div className="story-image">
              <img src={story.image} alt={story.title} />
              <span>{story.tag}</span>
            </div>
            <small>📅 {story.date} · 💬 0 comments</small>
            <h3>{story.title}</h3>
            <p>{story.excerpt}</p>
            <a className="story-read" href="#">
              Read more
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function FAQAndContact() {
  return (
    <section className="faq-contact section-card" id="contact">
      <div className="faq-block">
        <span>FAQ page</span>
        <h2>Common questions</h2>
        {faqs.map((item, i) => (
          <details key={item.q} open={i === 0}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
      <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
        <span>Customizable contact form</span>
        <h2>Need help choosing?</h2>
        <input placeholder="Your name" />
        <input type="email" placeholder="Email address" />
        <select defaultValue="">
          <option value="" disabled>
            What do you need?
          </option>
          {contactFormTopics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <textarea placeholder="Message" rows={4} />
        <button type="submit" className="dark-button">
          Send message
        </button>
      </form>
    </section>
  );
}

function Recommended({ title, products, openQuickView, addToCart }: { title: string; products: Product[]; openQuickView: (product: Product) => void; addToCart: (product: Product) => void }) {
  return (
    <section className="recommended section-card">
      <div className="section-heading row-heading"><h2>{title}</h2></div>
      <div className="mini-product-grid">
        {products.map((product) => <ProductCard key={product.id} product={product} openQuickView={openQuickView} addToCart={addToCart} />)}
      </div>
    </section>
  );
}

function CartDrawer({ open, onClose, cart, updateQty, subtotal, giftWrap, setGiftWrap, cartNote, setCartNote, checkout }: {
  open: boolean;
  onClose: () => void;
  cart: CartLine[];
  updateQty: (id: number, selectedColor: string | undefined, quantity: number) => void;
  subtotal: number;
  giftWrap: boolean;
  setGiftWrap: (value: boolean) => void;
  cartNote: string;
  setCartNote: (value: string) => void;
  checkout: () => void;
}) {
  return (
    <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="drawer-header"><h2>Cart</h2><button onClick={onClose}><Icon name="close" /></button></div>
      {cart.length === 0 ? <p className="empty-cart">Your cart is empty.</p> : (
        <div className="cart-lines">
          {cart.map((line) => (
            <div className="cart-line" key={`${line.id}-${line.selectedColor}`}>
              <img src={line.image} alt={line.title} />
              <div>
                <strong>{line.title}</strong>
                <span>{price(line.price)} · Finish <i style={{ background: line.selectedColor }} /></span>
                <div className="qty-control"><button onClick={() => updateQty(line.id, line.selectedColor, line.quantity - 1)}>-</button><input value={line.quantity} onChange={(event) => updateQty(line.id, line.selectedColor, Number(event.target.value))}/><button onClick={() => updateQty(line.id, line.selectedColor, line.quantity + 1)}>+</button></div>
              </div>
            </div>
          ))}
        </div>
      )}
      <label className="checkbox-line"><input type="checkbox" checked={giftWrap} onChange={(event) => setGiftWrap(event.target.checked)} /> Add gift wrapping (+$5)</label>
      <textarea value={cartNote} onChange={(event) => setCartNote(event.target.value)} placeholder="Cart note / delivery instructions" rows={4} />
      <div className="drawer-footer"><div><span>Subtotal</span><strong>{price(subtotal + (giftWrap ? 5 : 0))}</strong></div><button className="dark-button" onClick={checkout}>Checkout</button></div>
    </aside>
  );
}

function SearchOverlay({ open, onClose, searchTerm, setSearchTerm, results, openQuickView }: {
  open: boolean;
  onClose: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  results: Product[];
  openQuickView: (product: Product) => void;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="search-modal">
        <div className="drawer-header"><h2>Enhanced search</h2><button onClick={onClose}><Icon name="close" /></button></div>
        <input
          autoFocus
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search vacuums, air fryers, pet gadgets, car accessories..."
        />
        <div className="search-results">
          {results.map((product) => (
            <button type="button" key={product.id} onClick={() => { openQuickView(product); onClose(); }}>
              <img src={product.image} alt="" />
              <span>{product.title}</span>
              <strong>{price(product.price)}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickView({
  product,
  onClose,
  addToCart,
  openProduct,
}: {
  product: Product | null;
  onClose: () => void;
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void;
  openProduct: (product: Product) => void;
}) {
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || "#111");
  const [activeTab, setActiveTab] = useState("details");
  useEffect(() => setSelectedColor(product?.colors[0] || "#111"), [product]);
  useEffect(() => setActiveTab("details"), [product]);
  if (!product) return null;
  const related = getProductsBySlugs(product.relatedSlugs);
  return (
    <div className="modal-backdrop">
      <div className="quick-view-modal">
        <button type="button" className="modal-close" onClick={onClose}><Icon name="close" /></button>
        <div className="zoom-frame"><img src={product.image} alt={product.title} /></div>
        <div className="quick-info">
          <small>{product.brand}</small>
          <h2>{product.title}</h2>
          <div className="rating">
            <Icon name="star" size={15} /> {product.rating.toFixed(1)} ({product.reviewCount} reviews) · Only {product.stock} left
          </div>
          <div className="quick-price-row">
            <strong className="quick-price">{price(product.price)}</strong>
            {product.oldPrice ? <span className="quick-compare">{price(product.oldPrice)}</span> : null}
          </div>
          <p>{product.shortDescription}</p>
          <label>Finish options</label>
          <ColorSwatches colors={product.colors} selected={selectedColor} onPick={setSelectedColor} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <button type="button" className="dark-button" onClick={() => addToCart(product, 1, selectedColor)}>
              {product.preorder ? "Pre-order now" : "Add to cart"}
            </button>
            <Link href={`/products/${product.slug}`} className="outline-button" style={{ padding: "15px 22px" }} onClick={onClose}>
              Full details
            </Link>
          </div>
          <div className="product-tabs">
            {(["details", "shipping", "specs", "video"] as const).map((tab) => (
              <button type="button" key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {activeTab === "details" && (
              <div>
                <p>{product.description}</p>
                <ul className="tab-list">
                  {product.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === "shipping" && <p>{product.shippingReturns}</p>}
            {activeTab === "specs" && (
              <dl className="spec-dl">
                {product.fullSpecs.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {activeTab === "video" && <div className="video-box">Product video placeholder</div>}
          </div>
          {related.length > 0 && (
            <div className="related-inline">
              <label>Related products</label>
              <div className="related-chips">
                {related.map((p) => (
                  <button type="button" key={p.id} className="related-chip" onClick={() => openProduct(p)}>
                    <img src={p.image} alt="" width={40} height={40} />
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PromoPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="promo-popup">
      <button type="button" onClick={onClose}><Icon name="close" size={18} /></button>
      <span>{promoPopup.kicker}</span>
      <h3>{promoPopup.title}</h3>
      <p>
        Join the list for product drops and practical living tips. Use code <strong>{promoPopup.code}</strong> when checkout is connected.
      </p>
      <form onSubmit={(event) => event.preventDefault()}>
        <input placeholder="Email address" />
        <button type="submit">Claim</button>
      </form>
    </div>
  );
}
