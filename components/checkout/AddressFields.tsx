'use client';

import Input from '@/components/ui/Input';
import type { CartAddress } from '@/lib/types';

export interface AddressState {
  firstName: string;
  lastName: string;
  streetName: string;
  streetNumber: string;
  postalCode: string;
  city: string;
  state: string;
  phone: string;
}

export const EMPTY_ADDRESS: AddressState = {
  firstName: '',
  lastName: '',
  streetName: '',
  streetNumber: '',
  postalCode: '',
  city: '',
  state: '',
  phone: '',
};

export function toCartAddress(a: AddressState, country: string): CartAddress {
  return { ...a, country };
}

export function fromCartAddress(a?: CartAddress): AddressState {
  if (!a) return { ...EMPTY_ADDRESS };
  return {
    firstName: a.firstName ?? '',
    lastName: a.lastName ?? '',
    streetName: a.streetName ?? '',
    streetNumber: a.streetNumber ?? '',
    postalCode: a.postalCode ?? '',
    city: a.city ?? '',
    state: a.state ?? a.region ?? '',
    phone: a.phone ?? '',
  };
}

export default function AddressFields({
  value,
  onChange,
  country,
  idPrefix,
}: {
  value: AddressState;
  onChange: (next: AddressState) => void;
  country: string;
  idPrefix: string;
}) {
  const set = (key: keyof AddressState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [key]: e.target.value });

  const needsState = country === 'US';

  return (
    <div className="grid grid-cols-2 gap-3">
      <Input id={`${idPrefix}-firstName`} label="First name" value={value.firstName} onChange={set('firstName')} required />
      <Input id={`${idPrefix}-lastName`} label="Last name" value={value.lastName} onChange={set('lastName')} required />
      <div className="col-span-2 grid grid-cols-[1fr_120px] gap-3">
        <Input id={`${idPrefix}-streetName`} label="Street" value={value.streetName} onChange={set('streetName')} required />
        <Input id={`${idPrefix}-streetNumber`} label="No." value={value.streetNumber} onChange={set('streetNumber')} />
      </div>
      <Input id={`${idPrefix}-postalCode`} label="Postal code" value={value.postalCode} onChange={set('postalCode')} required />
      <Input id={`${idPrefix}-city`} label="City" value={value.city} onChange={set('city')} required />
      {needsState && (
        <Input id={`${idPrefix}-state`} label="State" value={value.state} onChange={set('state')} />
      )}
      <Input
        id={`${idPrefix}-phone`}
        label="Phone (optional)"
        value={value.phone}
        onChange={set('phone')}
        className={needsState ? '' : 'col-span-2'}
      />
    </div>
  );
}
