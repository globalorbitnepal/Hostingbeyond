import { randomBytes } from "crypto";

import type { BlogGuideType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { sanitizeBlogHtml } from "./sanitize";
import { estimateReadingTimeMinutes } from "./reading-time";
import { seedBlogTaxonomyIfEmpty } from "./queries";
import { slugifyTitle } from "./slug";

type StarterPost = {
  title: string;
  slug: string;
  categorySlug: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  keywords: string[];
  featured?: boolean;
  guideType?: BlogGuideType;
  contentHtml: string;
};

export const STARTER_POSTS: StarterPost[] = [
  {
    title: "How to Choose the Right Web Hosting for Your Business in 2026",
    slug: "how-to-choose-web-hosting-for-your-business",
    categorySlug: "hosting",
    excerpt:
      "A practical, jargon-free guide to picking hosting that matches your real traffic, budget and growth plans — plus the five questions to ask before you pay.",
    seoTitle: "How to Choose Web Hosting for Your Business (2026 Guide)",
    seoDescription:
      "Compare web hosting for your business on speed, storage, backups, support and price. A practical 2026 checklist to pick the right plan without overpaying.",
    focusKeyword: "web hosting for your business",
    keywords: ["web hosting", "small business hosting", "hosting plans"],
    featured: true,
    contentHtml: `
<p>Most hosting decisions fail for a boring reason: the plan was chosen from a pricing table instead of from how the site actually behaves. A brochure site with 400 visits a month and a WooCommerce store with 40,000 sessions need completely different infrastructure, even though both are "small business websites".</p>
<p>This guide walks through the decisions that matter, in the order they matter, so you can compare plans on the same footing.</p>
<h2>Start with real traffic numbers, not guesses</h2>
<p>Open your analytics and write down three numbers: monthly visitors, monthly page views, and your busiest single day in the last ninety days. Hosting plans are sized on concurrency — how many people are reading at the same moment — not on total monthly traffic.</p>
<p>A useful rule of thumb: one thousand page views per day usually means fewer than fifteen simultaneous readers. Hosting problems arrive during spikes, campaign launches and seasonal sales, so size for two to three times your normal peak.</p>
<h2>Understand what you are actually buying</h2>
<p>Every shared hosting plan bundles four resources: CPU time, memory, disk, and network. Providers rarely publish CPU limits clearly, which is why two "unlimited" plans can behave completely differently under load.</p>
<ul>
<li><strong>CPU and entry processes</strong> decide whether your site survives a traffic spike.</li>
<li><strong>Memory</strong> decides how much caching and how many plugins you can run.</li>
<li><strong>Disk type</strong> decides database speed. NVMe is materially faster than SATA SSD.</li>
<li><strong>Network</strong> decides delivery speed for visitors far from the server.</li>
</ul>
<h2>Check the technology stack, not just the price</h2>
<p>For WordPress, LiteSpeed with the LSCache plugin typically delivers better time to first byte than a generic Apache stack. Look for PHP 8.2 or newer, HTTP/3, Brotli compression and a modern MySQL or MariaDB version. If the provider publishes a PHP version older than 8.1, treat that as a sign of slow maintenance.</p>
<h2>Backups are part of the plan, not an add-on</h2>
<p>Ask three questions before you buy:</p>
<ol>
<li>How often are backups taken, and are they stored off the server?</li>
<li>How far back can I restore, and is a one-click restore included?</li>
<li>Who is responsible for verifying that the backup actually restores?</li>
</ol>
<p>A backup you have never tested is a rumour. Test one restore in your first week.</p>
<h2>Look at support quality, not support channels</h2>
<p>24/7 live chat means little if the first response is a copy-pasted article. Send a pre-sales question that requires a real answer — for example, "which PHP version and web server does my plan use, and do you support object caching?" The response time and specificity tell you more than any review site.</p>
<h2>Plan the exit before you need it</h2>
<p>You should be able to move hosts without downtime or data loss. Confirm that you get full cPanel or SSH access, unrestricted database exports, and the ability to point DNS independently. If a provider refuses any of these, the low price is buying you lock-in.</p>
<h2>A simple decision framework</h2>
<ul>
<li><strong>Brochure or blog site:</strong> shared hosting with NVMe storage, daily backups and LiteSpeed caching.</li>
<li><strong>Growing WordPress site:</strong> managed WordPress or cloud hosting with staging and a CDN.</li>
<li><strong>Store with real transactions:</strong> cloud or VPS with dedicated resources, object caching and monitored uptime.</li>
<li><strong>Custom application:</strong> VPS or cloud with root access, separate database, and a deployment pipeline.</li>
</ul>
<h2>What to do this week</h2>
<p>Measure your real traffic, test your current time to first byte, confirm your backups restore, and write down one growth scenario. With those four answers, plan comparison becomes straightforward instead of emotional.</p>
<h2>Common hosting mistakes that cost money later</h2>
<p>The first is buying on sticker price alone. A plan that saves three dollars a month but adds two seconds to every page load costs far more in lost conversions than it saves in hosting fees. Google's own guidance on <a href="https://web.dev/articles/vitals" rel="noopener noreferrer" target="_blank">Core Web Vitals</a> makes the connection between speed and user experience explicit.</p>
<p>The second is choosing annual prepayment before testing performance. Pay monthly for the first two months, measure real TTFB, and only then commit to a longer term.</p>
<p>The third is ignoring email. If your domain sends invoices and password resets, pick a plan or provider with authenticated email (SPF, DKIM and DMARC) rather than relying on a shared outgoing mail server with a poor reputation.</p>
<p>The fourth is treating staging as a luxury. Any site that takes payments or runs plugins needs a safe place to test updates. Ask whether staging is included before you buy.</p>
<h2>How to compare two plans in ten minutes</h2>
<ol>
<li>Install a fresh WordPress or static site on each host's trial.</li>
<li>Measure TTFB from three regions with a free tool.</li>
<li>Run a database-heavy page and watch memory and CPU limits.</li>
<li>Ask support a technical question and time the reply.</li>
<li>Confirm the export path: full database dump plus files, no restrictions.</li>
</ol>
<p>Choosing web hosting for your business is ultimately a risk decision, not a features decision. The right plan is the one that keeps your site fast during your busiest week, restores cleanly when something breaks, and lets you leave without hostage negotiations.</p>
<p>If you would rather start from a tested baseline, compare the <a href="/web-hosting">HostingBeyond web hosting plans</a> or read our <a href="/resources/tips">hosting guides</a> for step-by-step setup walkthroughs. When you are ready to pick a name for the site, our <a href="/domain-name-search">domain search</a> shows live availability and pricing.</p>
`,
  },
  {
    title:
      "Domain Names Explained: Registration, Renewal and DNS Without the Confusion",
    slug: "domain-names-explained-registration-renewal-dns",
    categorySlug: "domains",
    excerpt:
      "Registrars, registries, renewals, transfers and DNS records explained in plain English — including what really happens if you let a domain expire.",
    seoTitle: "Domain Names Explained: Registration, Renewal & DNS",
    seoDescription:
      "How domain names work end to end: registration, renewals, transfers and DNS records, what expiry really means, and how to protect the name your business depends on.",
    focusKeyword: "domain names",
    keywords: ["domain names", "dns records", "domain renewal"],
    guideType: "EXPLAINER",
    contentHtml: `
<p>A domain name looks simple from the outside: you pay once a year and your website works. Underneath there are three separate systems, and knowing which one you are talking to saves hours whenever something breaks. Domain names fail in three distinctly different ways, and each layer has its own vocabulary, support queue and fix.</p>
<h2>The three layers of a domain</h2>
<p><strong>The registry</strong> owns the extension. Verisign operates <code>.com</code>, for example. Registries set wholesale prices and keep the authoritative list of who owns which name.</p>
<p><strong>The registrar</strong> is the company you pay. It talks to the registry on your behalf and stores your contact data. HostingBeyond is a registrar for the extensions we sell.</p>
<p><strong>DNS</strong> is where your domain points. Nameservers hold records that translate a name into an IP address, an email route, or a verification token.</p>
<p>Almost every "my domain is broken" ticket is one of these three layers misbehaving, and the fix depends on identifying which one.</p>
<h2>What registration actually buys you</h2>
<p>Registration is a lease, not a purchase. You get exclusive use of the name for a fixed term, usually one to ten years. You do not own the string forever, which is why renewals matter so much.</p>
<h3>Registration vs. transfer vs. renewal</h3>
<ul>
<li><strong>Registration</strong> creates a new lease on a name nobody currently holds.</li>
<li><strong>Transfer</strong> moves the lease to a different registrar and normally adds a year.</li>
<li><strong>Renewal</strong> extends the lease with the current registrar.</li>
</ul>
<h2>What happens when a domain expires</h2>
<p>Expiry is a process, not an event. Most extensions follow a version of this timeline:</p>
<ol>
<li><strong>Expiry day.</strong> The name stops resolving in most cases, but you can usually still renew at the normal price.</li>
<li><strong>Grace period (roughly 0–45 days).</strong> Renewal is still possible at the standard rate.</li>
<li><strong>Redemption period (roughly 30 days).</strong> The registry can restore the name, usually for a significant fee.</li>
<li><strong>Pending delete, then release.</strong> The name returns to the open market and anyone can register it.</li>
</ol>
<p>If your domain carries your brand, email and customer trust, turn on auto-renew and keep the payment method current. The cheapest insurance you will ever buy.</p>
<h2>The DNS records you will actually touch</h2>
<h3>A and AAAA</h3>
<p><code>A</code> maps a name to an IPv4 address; <code>AAAA</code> maps it to IPv6. Your website's apex record is usually an A record.</p>
<h3>CNAME</h3>
<p><code>CNAME</code> points one name at another name. <code>www</code> commonly points at the apex or at a hosting-provided hostname.</p>
<h3>MX</h3>
<p><code>MX</code> tells the internet where to deliver email. Changing hosts rarely requires changing MX records unless you also move email.</p>
<h3>TXT</h3>
<p><code>TXT</code> carries verification and policy data: Google Search Console, Microsoft 365, and <code>SPF</code>, <code>DKIM</code> and <code>DMARC</code> for email authentication. Multiple TXT records are normal.</p>
<h2>Propagation is mostly caching</h2>
<p>DNS changes are published almost instantly, but resolvers cache answers for the duration of the record's TTL. That is why a change can look "half applied" for a few hours. Lower the TTL to five minutes a day before a planned migration, then raise it again afterwards.</p>
<p>If a record still has not changed after its TTL has passed, check three things in order: that you edited the zone at the registrar that actually hosts the DNS, that the nameservers in the domain's delegation match that zone, and that no second zone exists at an old provider. Domain names often point at a DNS host that is no longer the one holding the records.</p>
<h2>Choosing an extension without regret</h2>
<p>For a business, <code>.com</code> remains the safest default because it is what people type when they half-remember a brand. Country extensions build local trust but add residency requirements in some markets. Newer generic extensions can be excellent value for a specific product, provided you also register the matching <code>.com</code> if it is available.</p>
<p>Avoid hyphens and numbers where you can. They survive email, radio and verbal referrals badly. If the exact name is taken, a short modifier beats a misspelling every time.</p>
<h2>A domain checklist for every business</h2>
<ul>
<li>Register with an email address your company controls, not a personal one.</li>
<li>Enable registrar lock and two-factor authentication.</li>
<li>Turn on auto-renew and keep a card on file.</li>
<li>Keep the registrant contact details current — expiry notices go there.</li>
<li>Record your nameservers and critical records in your documentation.</li>
<li>Register the obvious misspellings of your brand if the budget allows.</li>
</ul>
<h2>Where to start</h2>
<p>Search availability and compare pricing on our <a href="/domain-name-search">domain name search</a>. Before you register, check the registry's published renewal price rather than the first-year promotion — that is the number you will pay every year after. ICANN publishes a useful <a href="https://www.icann.org/resources/pages/registrars-2012-02-25-en" rel="noopener noreferrer" target="_blank">overview of registrar obligations</a> if you want to know what a registrar must and must not do.</p>
<h2>Protecting a domain you already own</h2>
<p>Most domain incidents are administrative rather than technical. Work through this list once and put a reminder in the calendar for the same week each year:</p>
<ul>
<li>Confirm the registrant email is a mailbox the company controls, with two-factor authentication enabled.</li>
<li>Turn on registrar lock and confirm it is still enabled after any transfer.</li>
<li>Keep at least two payment methods on file for auto-renew.</li>
<li>Export your zone file quarterly and store it with your other runbooks.</li>
<li>Document which service owns each subdomain, especially anything used for email or verification.</li>
</ul>
<p>Domain names are cheap to keep and expensive to recover. A ten-minute annual review is the difference between a routine renewal and an emergency acquisition negotiation. Read the <a href="/resources/tips">domain guides</a> for step-by-step DNS walkthroughs, or search availability on our <a href="/domain-name-search">domain name search</a>.</p>
`,
  },
  {
    title:
      "Why Your WordPress Site Is Slow (and How to Fix It in the Right Order)",
    slug: "why-your-wordpress-site-is-slow",
    categorySlug: "wordpress",
    excerpt:
      "A diagnostic order that actually works: measure first, then fix hosting, caching, images, plugins and fonts — with the expected gain from each step.",
    seoTitle: "Why Your WordPress Site Is Slow — Fix It in the Right Order",
    seoDescription:
      "Find out why your WordPress site is slow and fix it step by step: measure TTFB, tune hosting and caching, compress images, trim plugins and load fonts correctly.",
    focusKeyword: "why your wordpress site is slow",
    keywords: ["wordpress speed", "core web vitals", "litespeed cache"],
    guideType: "TROUBLESHOOTING",
    contentHtml: `
<p>Speed work fails when it starts with a plugin instead of a measurement. Installing three caching plugins on a slow server makes the site more fragile without fixing the actual bottleneck. When people ask why your WordPress site is slow, the honest answer is almost always "we never measured it properly".</p>
<p>Work through these stages in order. Each one has a measurable outcome, so you always know whether it helped.</p>
<h2>Stage 1: Measure before you change anything</h2>
<p>Use PageSpeed Insights for field data and a lab test, then check time to first byte (TTFB) separately. TTFB measures the server, not the browser, and it is where most slow WordPress sites actually lose their time.</p>
<ul>
<li><strong>TTFB under 200 ms</strong> — server is healthy; optimise the front end.</li>
<li><strong>TTFB 200–600 ms</strong> — caching or hosting can improve.</li>
<li><strong>TTFB over 600 ms</strong> — fix hosting or database before touching plugins.</li>
</ul>
<h2>Stage 2: Fix the server and the database</h2>
<p>Install a query-monitoring plugin in staging and look for slow queries. Common culprits are unindexed meta queries from page builders and bloated <code>wp_options</code> tables from abandoned plugins.</p>
<p>Then check your PHP version. Moving from PHP 7.4 to 8.2 is often the single largest improvement available, and it is free. Ensure opcache is enabled and object caching (Redis) is available if your plan supports it.</p>
<h2>Stage 3: Page caching that matches your stack</h2>
<p>If your host runs LiteSpeed, use LSCache rather than a generic page cache. If it runs Nginx, use FastCGI cache or a host-provided cache. Two caching layers fighting each other produce stale pages and mysterious logins, so choose one.</p>
<p>Exclude cart, checkout and account pages from the cache. Cache the rest aggressively.</p>
<h2>Stage 4: Images, the reliable 30–60% win</h2>
<p>Images are usually the largest bytes on the page and the easiest to fix:</p>
<ol>
<li>Resize images to the maximum size they are displayed at, not the size they were uploaded at.</li>
<li>Convert to WebP or AVIF, keeping JPEG as a fallback only if you must.</li>
<li>Add <code>width</code> and <code>height</code> attributes so the layout does not shift.</li>
<li>Lazy-load everything below the fold; never lazy-load the hero image.</li>
</ol>
<h2>Stage 5: Fonts and third-party scripts</h2>
<p>Each web font family can cost 100–300 ms. Self-host one family, subset it to the characters you use, and preload the single weight used above the fold. For third-party scripts — chat widgets, pixels, review badges — load them after interaction or defer them. A chat bubble that costs 400 ms of main-thread time on every page load is rarely worth it.</p>
<h2>Stage 6: Trim plugins with evidence</h2>
<p>Do not count plugins; measure them. Deactivate plugins one at a time in staging and re-test TTFB and Total Blocking Time. Anything that changes nothing can usually go.</p>
<h2>What "fast" actually looks like</h2>
<ul>
<li>LCP under 2.5 seconds on mobile field data</li>
<li>INP under 200 milliseconds</li>
<li>CLS under 0.1</li>
<li>TTFB under 400 milliseconds on a warmed cache</li>
</ul>
<h2>A realistic order of operations</h2>
<p>Server and PHP, then one caching layer, then images, then fonts, then scripts, then plugins. Re-measure after every stage and keep a short log. In our experience this order reliably takes a typical business site from four or five seconds to under two.</p>
<h2>Where WordPress itself slows you down</h2>
<p>Core WordPress is fast. Slowness usually comes from the ecosystem: page builders that load a second copy of jQuery, plugins that query the database on every request, and themes that ship every Google font weight. The WordPress project publishes <a href="https://developer.wordpress.org/advanced-administration/performance/optimization/" rel="noopener noreferrer" target="_blank">official performance guidance</a> that is worth reading once before installing a stack of optimisation plugins.</p>
<p>Two specific traps deserve attention:</p>
<ul>
<li><strong>Autoloaded options.</strong> Every option marked autoload is loaded on every request. A plugin that leaves large rows behind quietly taxes every page.</li>
<li><strong>REST and admin-ajax calls.</strong> Widgets that poll <code>admin-ajax.php</code> turn a static page into a database workload. Cache them or load them on interaction.</li>
</ul>
<h2>When to stop optimising and change hosts</h2>
<p>If TTFB stays above 600 ms on a warmed cache after fixing PHP, caching and the database, the server is the ceiling. Shared hosting enforces CPU and entry-process limits that no plugin can bypass. At that point compare plans with explicit NVMe storage, LiteSpeed or Nginx, and a documented CPU allowance.</p>
<p>If the server itself is the ceiling, compare <a href="/web-hosting/wordpress">WordPress hosting</a> plans built on LiteSpeed and NVMe storage, or read more <a href="/resources/tips">performance guides</a>. Verify improvements with Google's <a href="https://pagespeed.web.dev/" rel="noopener noreferrer" target="_blank">PageSpeed Insights</a> before and after every change.</p>
`,
  },
  {
    title:
      "SPF DKIM DMARC: Business Email Authentication Without the Guesswork",
    slug: "spf-dkim-dmarc-business-email",
    categorySlug: "business-email",
    excerpt:
      "The three DNS records that decide whether your email reaches the inbox, what each one does, and how to roll out DMARC safely without blocking your own mail.",
    seoTitle: "SPF DKIM DMARC: Business Email Authentication Setup",
    seoDescription:
      "Set up SPF DKIM DMARC correctly for business email: what each record does, how alignment works, and how to enforce DMARC without losing legitimate mail.",
    focusKeyword: "spf dkim dmarc",
    keywords: ["business email", "email deliverability", "dns"],
    guideType: "HOW_TO",
    contentHtml: `
<p>Professional email on your own domain is one of the highest-trust signals a small business can send. It is also the easiest thing to misconfigure, because three DNS records must agree with each other before inboxes start trusting you. SPF, DKIM and DMARC are not optional extras; they are the difference between a sale and a spam folder.</p>
<h2>What each record does</h2>
<h3>SPF — who may send as your domain</h3>
<p>SPF is a TXT record listing the servers allowed to send email for your domain. Receivers check the sending IP against that list. You get exactly one SPF record per domain, which is why "too many SPF records" is such a common failure: two records means SPF cannot be evaluated at all.</p>
<h3>DKIM — proof the message was not altered</h3>
<p>DKIM adds a cryptographic signature to each outgoing message. The public key lives in DNS, so receivers can verify that the message came from your infrastructure and was not modified in transit. Every sending service needs its own selector.</p>
<h3>DMARC — what to do when both fail</h3>
<p>DMARC ties SPF and DKIM together and tells receivers how to treat mail that fails both. It also sends you reports, which is how you discover what is legitimately sending as your domain.</p>
<h2>Start in monitoring mode</h2>
<p>Never begin at <code>p=reject</code>. Start here:</p>
<pre><code>v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; pct=100</code></pre>
<p>Leave it at <code>p=none</code> for at least two weeks. Read the aggregate reports. You will usually find three things: your main mail provider (expected), a website contact form (expected but often unsigned), and something you forgot about, such as an old newsletter tool or a CRM.</p>
<h2>Align before you enforce</h2>
<p>DMARC passes only when SPF or DKIM passes <em>and</em> aligns with your domain. A sending service that uses its own bounce domain will pass SPF but fail alignment. Either move it to a subdomain or configure DKIM for your domain on that service.</p>
<h2>Move to quarantine, then reject</h2>
<p>Once reports are clean:</p>
<ol>
<li>Change to <code>p=quarantine; pct=25</code>, watch for a week.</li>
<li>Raise <code>pct</code> to 50, then 100.</li>
<li>Move to <code>p=reject</code>.</li>
</ol>
<p>Keep <code>rua</code> reporting on permanently. DMARC is not a one-time setup; it is an ongoing inventory of who sends as you.</p>
<h2>The mistakes that cause real outages</h2>
<ul>
<li><strong>Two SPF records.</strong> Merge them into one, staying under ten DNS lookups.</li>
<li><strong>DKIM selector deleted during a migration.</strong> Keep old selectors for at least thirty days.</li>
<li><strong>Mailboxes on a different provider than the MX record.</strong> Verify MX points to the provider that actually holds the inboxes.</li>
<li><strong>Forwarding loops.</strong> Forwarded mail often fails SPF. Use a forwarding service that rewrites the sender or keeps DKIM intact.</li>
</ul>
<h2>Test before you announce</h2>
<p>Send a test message to a Gmail address and inspect the original. You should see <code>spf=pass</code>, <code>dkim=pass</code> and <code>dmarc=pass</code>. Do the same for Outlook. If any of the three fails, fix that record before rolling out to the team.</p>
<p>Repeat this test after every change to your sending stack. A CRM trial, a new contact form plugin or a switched newsletter provider can all add an unauthorised sender, and with SPF, DKIM and DMARC already enforced, that sender fails quietly until someone notices the bounce reports.</p>
<h2>Then make it usable</h2>
<p>Authentication gets you into the inbox; the mailbox experience keeps your team productive. Enable two-factor authentication, set up aliases for roles such as <code>support@</code> and <code>billing@</code>, and document who owns each alias.</p>
<h2>A worked example</h2>
<p>Suppose your domain sends mail from three places: your main mailbox provider, a website contact form, and a CRM. Start with one SPF record that includes all three mechanisms, then give each service its own DKIM selector:</p>
<pre><code>v=spf1 include:_spf.mailprovider.com include:_spf.forms.example.net include:_spf.crm.example.com -all</code></pre>
<p>Keep the total DNS lookups under ten — that is the hard limit in the SPF specification. If you exceed it, mail fails without any obvious error, which is why "include" chains should be audited every year.</p>
<p>Then publish DKIM selectors such as <code>s1</code>, <code>forms</code> and <code>crm</code>, and keep every selector in DNS as long as the service may still send. Removing a selector early is one of the most common causes of sudden deliverability drops.</p>
<h2>Monitoring after enforcement</h2>
<p>Once you are at <code>p=reject</code>, review reports monthly. Add a <code>ruf</code> address only if you can process forensic reports; they are verbose and often contain personal data. Aggregate reports from <code>rua</code> are enough for most businesses.</p>
<p>The payoff is measurable: fewer spam-folder placements, fewer spoofed invoices using your name, and better placement for transactional mail such as password resets. The <a href="https://dmarc.org/overview/" rel="noopener noreferrer" target="_blank">DMARC specification overview</a> covers the syntax if you want the authoritative reference.</p>
<p>Ready to move? Explore <a href="/business-email">HostingBeyond business email</a> or read more <a href="/resources/tips">email guides</a>.</p>
`,
  },
  {
    title:
      "SSL Certificates in Plain English: What They Do and What They Do Not",
    slug: "ssl-certificates-plain-english",
    categorySlug: "security",
    excerpt:
      "Encryption, validation levels and the browser padlock explained without fearmongering — plus how to avoid the renewal outage that catches most teams.",
    seoTitle: "SSL Certificates Explained: Encryption, Types and Renewal",
    seoDescription:
      "An ssl certificate encrypts traffic and proves domain control — nothing more. Learn DV, OV and EV validation, wildcard coverage and how to stop renewal outages.",
    focusKeyword: "ssl certificate",
    keywords: ["https", "tls", "website security"],
    guideType: "EXPLAINER",
    contentHtml: `
<p>An SSL certificate is the least controversial security control on the internet, and also the most misunderstood. It encrypts traffic. It does not make a website trustworthy, and it does not stop a site from being hacked.</p>
<h2>What a certificate actually does</h2>
<p>Two things:</p>
<ol>
<li><strong>Encryption.</strong> Data between the browser and the server is unreadable to anyone in between — useful on public Wi-Fi and mandatory for card payments.</li>
<li><strong>Identity binding.</strong> It proves the server answering for a domain is authorised to do so, issued by a certificate authority that verified control of the domain.</li>
</ol>
<p>That is why browsers warn on plain HTTP: without a certificate, a login form can be read or altered in transit.</p>
<h2>The validation levels, honestly</h2>
<h3>Domain validated (DV)</h3>
<p>The authority confirms you control the domain — usually through a DNS record or a file. Issued in minutes, free to cheap, and perfectly adequate for most websites. Encryption is identical to more expensive options.</p>
<h3>Organisation validated (OV)</h3>
<p>The authority also verifies your legal entity exists. Useful where procurement requires evidence of business verification. Takes days and needs paperwork.</p>
<h3>Extended validation (EV)</h3>
<p>The strictest verification. Browsers no longer show a special green bar, so the practical difference is mostly internal or contractual rather than visible to visitors.</p>
<h2>What a certificate does not do</h2>
<ul>
<li>It does not fix an outdated plugin or a weak password.</li>
<li>It does not prevent phishing on a lookalike domain.</li>
<li>It does not guarantee the business is honest.</li>
<li>It does not remove the need for backups.</li>
</ul>
<p>Treat HTTPS as table stakes, not as a security strategy.</p>
<h2>Wildcard, multi-domain and SAN</h2>
<p>A <strong>wildcard</strong> covers <code>*.example.com</code> in one certificate — convenient when you run many subdomains. A <strong>multi-domain</strong> certificate covers several different domains. A <strong>SAN</strong> field is simply the list of names a certificate covers; every modern certificate has one.</p>
<h2>The renewal outage</h2>
<p>Most certificate incidents are not attacks; they are expired certificates. Free 90-day certificates from Let's Encrypt are excellent, provided renewal is automated. If renewal depends on a person remembering, it will eventually fail at the worst possible time.</p>
<p>Check three things today:</p>
<ol>
<li>Is auto-renew enabled for every domain and subdomain?</li>
<li>Will renewal succeed if the server's webroot moves?</li>
<li>Do you get an alert at thirty, fourteen and seven days before expiry?</li>
</ol>
<h2>Installing and verifying</h2>
<p>After installation, verify with a TLS checker and confirm:</p>
<ul>
<li>The chain is complete, including intermediates.</li>
<li>TLS 1.2 and 1.3 are enabled; older versions are disabled.</li>
<li>HTTP redirects permanently to HTTPS.</li>
<li>Mixed content warnings are gone — every image, script and font loads over HTTPS.</li>
</ul>
<h2>Choosing for a small business</h2>
<p>Start with a DV certificate and automate renewal. Move to OV only when a customer or auditor asks. Spend the saved budget on backups, monitoring and two-factor authentication, which reduce real risk far more than a higher validation tier.</p>
<h2>What to check on every new host</h2>
<p>When you move hosting, the certificate usually moves with it, which is exactly when coverage breaks. After any migration:</p>
<ul>
<li>Confirm the new server serves the certificate for the apex domain <em>and</em> every <code>www</code> variant you use.</li>
<li>Re-test the certificate chain. A missing intermediate shows a warning in some browsers but not others.</li>
<li>Check that HTTP Strict Transport Security is enabled only after HTTPS works everywhere.</li>
<li>Update any monitoring that watched the old certificate path.</li>
</ul>
<p>The <a href="https://letsencrypt.org/docs/" rel="noopener noreferrer" target="_blank">Let&apos;s Encrypt documentation</a> explains the automatic renewal model clearly, and it is the model worth copying even if you buy commercial certificates.</p>
<h2>A five-minute audit</h2>
<p>Open your site in a private window, click the padlock, and confirm the certificate covers the exact hostname, is currently valid, and uses a modern chain. Then repeat for your checkout or login subdomain. Most teams find at least one neglected hostname on the first pass — often the one that sends email or handles payments.</p>
<p>Compare coverage options on our <a href="/web-hosting/ssl">SSL certificates page</a>, or read more <a href="/resources/tips">security guides</a>.</p>
`,
  },
];

async function ensureEditorialAuthor() {
  const existing = await prisma.blogAuthor.findFirst({
    where: { name: "HostingBeyond Editorial" },
  });
  if (existing) return existing;
  return prisma.blogAuthor.create({
    data: {
      name: "HostingBeyond Editorial",
      displayName: "HostingBeyond Editorial",
      role: "Editorial team",
      bio: "Practical hosting, domain and website guidance written and reviewed by the HostingBeyond team.",
    },
  });
}

/**
 * Seeds a small, genuinely useful starter library the first time the blog is
 * empty, so `/resources/blog` never launches as a blank page.
 *
 * Runs only when there are zero posts. Never overwrites editor content.
 */
export async function seedStarterBlogPostsIfEmpty() {
  try {
    const existing = await prisma.blogPost.count();
    if (existing > 0) return;
  } catch {
    return;
  }

  await seedBlogTaxonomyIfEmpty();
  const author = await ensureEditorialAuthor();

  const categorySlugs = [...new Set(STARTER_POSTS.map((p) => p.categorySlug))];
  const categories = await prisma.blogCategory.findMany({
    where: { slug: { in: categorySlugs } },
    select: { id: true, slug: true },
  });
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  const now = Date.now();
  let index = 0;

  for (const post of STARTER_POSTS) {
    const contentHtml = sanitizeBlogHtml(post.contentHtml.trim());
    const slug = slugifyTitle(post.slug) || slugifyTitle(post.title);
    const taken = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (taken) continue;

    try {
      await prisma.blogPost.create({
        data: {
          title: post.title,
          slug,
          excerpt: post.excerpt,
          contentHtml,
          status: "PUBLISHED",
          contentType: "BLOG",
          guideType: post.guideType ?? null,
          featured: Boolean(post.featured),
          authorId: author.id,
          categoryId: categoryBySlug.get(post.categorySlug) ?? null,
          publishedAt: new Date(now - index * 86_400_000),
          readingTimeMinutes: estimateReadingTimeMinutes(contentHtml),
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          focusKeyword: post.focusKeyword,
          seoKeywords: post.keywords,
          ogTitle: post.seoTitle,
          ogDescription: post.seoDescription,
          schemaType: "BlogPosting",
          previewToken: randomBytes(24).toString("hex"),
        },
      });
    } catch {
      // A concurrent request already seeded this slug — safe to skip.
    }
    index += 1;
  }
}
