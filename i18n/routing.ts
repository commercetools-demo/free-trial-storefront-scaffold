import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { COUNTRY_CONFIG } from '@/lib/utils';

export const routing = defineRouting({
  locales: Object.keys(COUNTRY_CONFIG) as [string, ...string[]],
  defaultLocale: 'en-US',
  localePrefix: 'always',
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
