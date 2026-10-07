import Link from "next/link";

export default function OrbitBlogMediaPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Blog media</h1>
      <p className="text-sm text-slate-600">
        Blog images use the shared Orbit media library (upload, alt text,
        search).
      </p>
      <Link
        href="/orbit/media"
        className="inline-flex rounded-xl bg-[#673de6] px-4 py-2.5 text-sm font-semibold text-white"
      >
        Open media library
      </Link>
    </div>
  );
}
