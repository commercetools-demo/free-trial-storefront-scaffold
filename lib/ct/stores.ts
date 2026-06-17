import { apiRoot } from './client';

export interface StoreChannelData {
  storeId: string | undefined;
  supplyChannelId: string | undefined;
  distributionChannelId: string | undefined;
  productSelectionId: string | undefined;
}

// Module-level cache — persists for the server instance lifetime, no TTL.
// Single source of truth for all store → channel mappings.
const storeDataCache = new Map<string, StoreChannelData>();

export async function getStoreChannelData(storeKey: string): Promise<StoreChannelData> {
  if (storeDataCache.has(storeKey)) return storeDataCache.get(storeKey)!;
  try {
    const { body } = await apiRoot.stores().withKey({ key: storeKey }).get().execute();
    const data: StoreChannelData = {
      storeId: body.id,
      supplyChannelId: body.supplyChannels?.[0]?.id,
      distributionChannelId: body.distributionChannels?.[0]?.id,
      productSelectionId: body.productSelections?.[0]?.productSelection?.id,
    };
    storeDataCache.set(storeKey, data);
    return data;
  } catch {
    return {
      storeId: undefined,
      supplyChannelId: undefined,
      distributionChannelId: undefined,
      productSelectionId: undefined,
    };
  }
}
