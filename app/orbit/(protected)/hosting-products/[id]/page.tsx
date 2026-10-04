"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { HostingProductEditor } from "@/components/orbit/hosting-product-editor";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitHostingProductEditPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<null | Record<string, unknown>>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/orbit/hosting-products/${params.id}`);
        if (!res.ok) {
          const parsed = await readResponseError(res, "Load failed");
          throw new Error(parsed.text);
        }
        const json = (await res.json()) as {
          product?: Record<string, unknown>;
        };
        setProduct(json.product ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Load failed");
      }
    })();
  }, [params.id]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!product) {
    return <p className="text-sm text-slate-600">Loading product…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <Link
          href="/orbit/hosting-products"
          className="text-sm text-violet-600 underline"
        >
          ← Hosting products
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">
          {String(product.name)}
        </h1>
        <p className="text-sm text-slate-600">
          {String(product.canonicalPath)}
        </p>
      </div>
      <HostingProductEditor initial={product as never} />
    </div>
  );
}
