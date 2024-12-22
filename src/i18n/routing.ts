import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
import { DEFAULT_LOCALE, LOCALES } from '@/lib/constants';
 
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
	localeDetection: true,
	localePrefix: 'always',
	alternateLinks: true,
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);