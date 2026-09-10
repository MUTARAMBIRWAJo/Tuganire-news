import Link from 'next/link';
import Image from 'next/image';
import { categoryHref } from '@/lib/category-utils';

export default function FeaturedHero({
  item
}: {
  item?: {
    slug: string;
    title: string;
    excerpt: string | null;
    featured_image: string | null;
    categories?: { name: string; slug: string } | null;
    authors?: { display_name: string | null; avatar_url: string | null } | null;
  } | null;
}) {
  if (!item) return null;

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="grid items-stretch gap-6 md:grid-cols-2">
        <div className="flex items-center justify-center">
          <div className="mx-auto flex justify-center items-center w-full max-w-3xl p-4 bg-gray-50 rounded-xl">
            {item.featured_image ? (
              <Image
                src={item.featured_image}
                alt={item.title}
                width={1200}
                height={800}
                loading="lazy"
                className="w-full h-auto object-contain rounded-xl"
              />
            ) : null}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-sm text-neutral-500">
            {item.categories?.name ? (
              <Link href={categoryHref(item.categories.slug || item.categories.name)} className="hover:underline">
                {item.categories.name}
              </Link>
            ) : null}
          </div>
          <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">
            <Link href={`/articles/${item.slug}`}>{item.title}</Link>
          </h1>
          {item.excerpt ? <p className="mt-3 text-neutral-700">{item.excerpt}</p> : null}
          {item.authors?.display_name ? (
            <div className="mt-4 text-sm text-neutral-500">By {item.authors.display_name}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}


