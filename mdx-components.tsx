import type { MDXComponents } from 'mdx/types';
import { articleComponents } from '@/lib/mdx';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components, ...articleComponents };
}
