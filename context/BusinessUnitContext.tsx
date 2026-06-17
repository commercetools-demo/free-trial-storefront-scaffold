'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { KEY_BUSINESS_UNITS } from '@/lib/cache-keys';
import { useAccount } from '@/hooks/useAccount';
import type { BusinessUnit, BusinessUnitStoreRef } from '@/lib/types';

interface BusinessUnitContextValue {
  businessUnits: BusinessUnit[];
  currentBusinessUnit: BusinessUnit | null;
  currentStore: BusinessUnitStoreRef | null;
  isLoading: boolean;
  selectBusinessUnit: (id: string) => Promise<void>;
  selectStore: (storeKey: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<BusinessUnitContextValue | null>(null);

async function postSelect(businessUnitKey: string, storeKey: string) {
  const res = await fetch('/api/business-units/select', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ businessUnitKey, storeKey }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'BU select failed');
}

export function BusinessUnitProvider({ children }: { children: ReactNode }) {
  const { user } = useAccount();
  const { mutate } = useSWRConfig();
  const [currentBusinessUnit, setCurrentBusinessUnit] = useState<BusinessUnit | null>(null);
  const [currentStore, setCurrentStore] = useState<BusinessUnitStoreRef | null>(null);
  const autoSelected = useRef(false);

  const { data: businessUnits, isLoading, mutate: mutateBUs } = useSWR<BusinessUnit[]>(
    user ? KEY_BUSINESS_UNITS : null,
    async () => {
      const res = await fetch('/api/business-units');
      return res.ok ? ((await res.json()).businessUnits ?? []) : [];
    },
    { revalidateOnFocus: false }
  );

  // Clear on logout
  useEffect(() => {
    if (!user) {
      setCurrentBusinessUnit(null);
      setCurrentStore(null);
      autoSelected.current = false;
      mutate(KEY_BUSINESS_UNITS, [], { revalidate: false });
    }
  }, [user, mutate]);

  // Auto-select first BU + first store on first load
  useEffect(() => {
    if (autoSelected.current) return;
    if (!businessUnits || businessUnits.length === 0) return;
    autoSelected.current = true;
    const bu = businessUnits[0];
    const store = bu.stores[0];
    setCurrentBusinessUnit(bu);
    setCurrentStore(store ?? null);
    if (store) {
      postSelect(bu.key, store.key).catch(() => {
        autoSelected.current = false;
      });
    }
  }, [businessUnits]);

  async function selectBusinessUnit(id: string) {
    const bu = businessUnits?.find((b) => b.id === id);
    if (!bu) return;
    const store = bu.stores[0];
    if (store) await postSelect(bu.key, store.key);
    setCurrentBusinessUnit(bu);
    setCurrentStore(store ?? null);
  }

  async function selectStore(storeKey: string) {
    if (!currentBusinessUnit) return;
    const store = currentBusinessUnit.stores.find((s) => s.key === storeKey);
    if (!store) return;
    await postSelect(currentBusinessUnit.key, store.key);
    setCurrentStore(store);
  }

  async function refresh() {
    const fresh = await mutateBUs();
    if (fresh && currentBusinessUnit) {
      const updated = fresh.find((b) => b.id === currentBusinessUnit.id);
      if (updated) setCurrentBusinessUnit(updated);
    }
  }

  return (
    <Ctx.Provider
      value={{
        businessUnits: businessUnits ?? [],
        currentBusinessUnit,
        currentStore,
        isLoading,
        selectBusinessUnit,
        selectStore,
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useBusinessUnit(): BusinessUnitContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBusinessUnit must be used within BusinessUnitProvider');
  return ctx;
}
