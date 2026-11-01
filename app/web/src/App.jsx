import { useState } from "react";
import ChatWidget from "./components/ChatWidget.jsx";

const NAV = [
  { id: "products", label: "Printers & Products" },
  { id: "software", label: "Software" },
  { id: "features", label: "Features" },
  { id: "support", label: "Support" },
];

const PRODUCTS = [
  {
    name: "Xerox® B305 / B315 Multifunction Printer",
    tag: "Monochrome MFP",
    blurb:
      "A compact black-and-white multifunction printer for print, copy, and scan — with fax on the B315. Set up with the Initial Setup Wizard or the Xerox® Easy Assist (XEA) app.",
    points: ["Print, copy, scan", "Fax (B315)", "Wi-Fi & Wi-Fi Direct", "AirPrint & Mopria"],
  },
  {
    name: "Xerox® Multifunction Printers",
    tag: "Office fleet",
    blurb:
      "Large- and small-touchscreen office devices. Use secure print release, scan to email, scan to your home folder (OneDrive), and scan to a network folder.",
    points: ["Touchscreen control", "Secure Print Release", "Scan to email / folder", "Copy & Fax"],
  },
];

const FEATURES = [
  {
    icon: "🖨️",
    title: "Printing",
    text: "Release secure jobs at the device and run one-sided or two-sided printing from the touchscreen.",
  },
  {
    icon: "📷",
    title: "Scanning",
    text: "Scan straight to your email, your home folder (OneDrive), or a shared network folder.",
  },
  {
    icon: "📠",
    title: "Copy & Fax",
    text: "Make copies and send faxes directly from the control panel with simple guided steps.",
  },
  {
    icon: "⚙️",
    title: "Easy setup",
    text: "Xerox® Smart Start finds your printer and installs the best driver for Windows 11 and 10.",
  },
];

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="page">
      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top" onClick={() => scrollTo("top")}>
            <span className="brand-mark">✕</span>
            <span className="brand-name">xerox</span>
          </a>

          <nav className={`nav ${menuOpen ? "open" : ""}`}>
            {NAV.map((item) => (
              <button
                key={item.id}
                className="nav-link"
                onClick={() => {
                  scrollTo(item.id);
                  setMenuOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            className="menu-toggle"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            ☰
          </button>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <h1>Is work getting in the way of work?</h1>
            <p className="hero-sub">We make work, work.</p>
            <div className="hero-actions">
              <button className="btn btn-light" onClick={() => scrollTo("products")}>
                Shop Printers
              </button>
              <button className="btn btn-outline" onClick={() => scrollTo("support")}>
                Get Support
              </button>
            </div>
          </div>
        </section>

        {/* Quick categories */}
        <section className="categories">
          {[
            "Remote Office Printers",
            "Multifunction Printers",
            "Production Presses",
            "Xerox Genuine Supplies",
            "Digital Services",
            "IT Solutions",
          ].map((c) => (
            <div key={c} className="category">
              <div className="category-icon">🗎</div>
              <span>{c}</span>
            </div>
          ))}
        </section>

        {/* Products */}
        <section id="products" className="section">
          <h2 className="section-title">Printers &amp; Products</h2>
          <p className="section-lead">
            Devices documented in this site’s knowledge base. Ask the assistant anything about them.
          </p>
          <div className="card-grid">
            {PRODUCTS.map((p) => (
              <article key={p.name} className="card">
                <span className="card-tag">{p.tag}</span>
                <h3>{p.name}</h3>
                <p>{p.blurb}</p>
                <ul className="card-points">
                  {p.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Software */}
        <section id="software" className="section section-alt">
          <h2 className="section-title">Software — Xerox® Smart Start</h2>
          <div className="split">
            <div>
              <p className="section-lead">
                Xerox® Smart Start is an easy-to-use Windows installer that helps administrators and
                users select and install the best print software for their printer.
              </p>
              <ul className="check-list">
                <li>Finds network printers automatically</li>
                <li>Recommends the driver that gives the best experience</li>
                <li>Installs the Global Print Driver or product-specific driver</li>
                <li>Installs TWAIN and WIA scan drivers</li>
                <li>Supports Windows 11 and Windows 10</li>
              </ul>
            </div>
            <div className="callout">
              <h4>Supported systems</h4>
              <p>Windows 11 · Windows 10</p>
              <p className="callout-note">
                IPP is the default print system in recent versions of Smart Start.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="section">
          <h2 className="section-title">What you can do</h2>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Support */}
        <section id="support" className="section section-alt">
          <h2 className="section-title">Support</h2>
          <p className="section-lead">
            Have a question about setup, printing, scanning, supplies, or troubleshooting? Open the
            chat in the bottom-right corner — the assistant answers using the official Xerox
            documentation only.
          </p>
          <div className="doc-list">
            <div className="doc">📄 Xerox Multifunction Printers — User Guide</div>
            <div className="doc">📄 Xerox Smart Start — Customer Tip (v4.1)</div>
            <div className="doc">📄 Xerox B305 / B315 — User Guide</div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="brand">
          <span className="brand-mark">✕</span>
          <span className="brand-name">xerox</span>
        </div>
        <p>Demo site · Content and answers are grounded in the provided Xerox documents.</p>
      </footer>

      {/* The AI assistant, docked bottom-right */}
      <ChatWidget />
    </div>
  );
}
