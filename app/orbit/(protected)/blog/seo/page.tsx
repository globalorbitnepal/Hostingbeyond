export default function OrbitBlogSeoPage() {
  return (
    <div className="prose prose-slate max-w-3xl">
      <h1>Blog SEO</h1>
      <p>
        Configure per-post SEO in the post editor (title, description, focus
        keyword, Open Graph, canonical, robots). Category and tag SEO fields are
        managed on their respective admin pages when editing items.
      </p>
      <ul>
        <li>
          Public blog: <code>/resources/blog</code>
        </li>
        <li>
          RSS: <code>/resources/blog/rss.xml</code>
        </li>
        <li>Drafts use secure preview tokens and stay noindex.</li>
      </ul>
    </div>
  );
}
