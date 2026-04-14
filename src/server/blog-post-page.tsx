import { createServerFn } from '@tanstack/react-start'
import { createCompositeComponent } from '@tanstack/react-start/rsc'
import { run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { client } from '@/orpc/client'

type PostPageSlots = {
  renderPostMeta: (p: { slug: string; date: string; title: string }) => React.ReactNode
  renderReactions: (p: { slug: string }) => React.ReactNode
  renderComments: (p: { postSlug: string }) => React.ReactNode
}

export const getBlogPostPage = createServerFn().handler(async (ctx) => {
  const { slug } = ctx.data as unknown as { slug: string }
    const post = await client.blog.getPost({ slug })

    if (!post) throw new Error(`Post not found: ${slug}`)

    // run() executes the compiled MDX function-body server-side.
    // @mdx-js/mdx and rehype-shiki never ship to the client bundle.
    const { default: MDXContent } = (await run(
      post.code,
      runtime as Parameters<typeof run>[1],
    )) as { default: React.ComponentType }

    const src = await createCompositeComponent((props: PostPageSlots) => (
      <main id='main-content' className='mx-auto max-w-3xl px-4 py-24 md:py-32'>
        <a
          href='/blog'
          className='inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-8'
        >
          <span aria-hidden>←</span>
          {' '}Back to posts
        </a>

        <header className='mb-10'>
          {props.renderPostMeta({
            slug,
            date: post.frontmatter.date,
            title: post.frontmatter.title,
          })}
          <h1 className='text-4xl font-bold tracking-tight text-text-primary mb-3'>
            {post.frontmatter.title}
          </h1>
          <p className='text-text-secondary leading-relaxed'>
            {post.frontmatter.description}
          </p>
        </header>

        {props.renderReactions({ slug })}

        <article className='prose prose-neutral dark:prose-invert max-w-none mt-10'>
          <MDXContent />
        </article>

        {props.renderComments({ postSlug: slug })}
      </main>
    ))

    return { src }
  },
)

