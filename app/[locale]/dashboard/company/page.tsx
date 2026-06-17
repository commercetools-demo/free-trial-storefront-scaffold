'use client';
import { useState } from 'react';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, Button, Input, Label, Badge, Alert } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Table, type Column } from '@/components/ui/Table';
import { formatAddress } from '@/lib/utils';
import type { Associate, Address } from '@/lib/types';

export default function CompanyPage() {
  const { currentBusinessUnit: bu, refresh } = useBusinessUnit();
  const { can } = usePermissions();
  const canEdit = can('UpdateBusinessUnitDetails');

  const [editOpen, setEditOpen] = useState(false);
  const [addrOpen, setAddrOpen] = useState(false);

  if (!bu) return null;

  const associateColumns: Column<Associate & { id?: string }>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (a) => [a.firstName, a.lastName].filter(Boolean).join(' ') || '—',
    },
    { key: 'email', header: 'Email', render: (a) => a.email ?? '—' },
    {
      key: 'roles',
      header: 'Roles',
      render: (a) => (
        <span className="flex flex-wrap gap-1">
          {a.roleKeys.map((r) => (
            <Badge key={r} tone="info">
              {r}
            </Badge>
          ))}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-charcoal">Company</h1>
      </div>

      {/* Details */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-charcoal">Details</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="w-32 text-charcoal-light">Name</dt>
                <dd className="text-charcoal">{bu.name}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 text-charcoal-light">Type</dt>
                <dd className="text-charcoal">{bu.unitType}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 text-charcoal-light">Key</dt>
                <dd className="text-charcoal">{bu.key}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 text-charcoal-light">Contact email</dt>
                <dd className="text-charcoal">{bu.contactEmail ?? '—'}</dd>
              </div>
              {bu.status && (
                <div className="flex gap-2">
                  <dt className="w-32 text-charcoal-light">Status</dt>
                  <dd>
                    <Badge tone={bu.status === 'Active' ? 'success' : 'neutral'}>{bu.status}</Badge>
                  </dd>
                </div>
              )}
            </dl>
          </div>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          )}
        </div>
      </Card>

      {/* Addresses */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-charcoal">Addresses</h2>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => setAddrOpen(true)}>
              Add address
            </Button>
          )}
        </div>
        {bu.addresses.length === 0 ? (
          <p className="mt-3 text-sm text-charcoal-light">No addresses yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {bu.addresses.map((a) => (
              <li key={a.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <span className="text-charcoal-light">{formatAddress(a)}</span>
                {a.id === bu.defaultShippingAddressId && <Badge tone="success">Default shipping</Badge>}
                {a.id === bu.defaultBillingAddressId && <Badge tone="info">Default billing</Badge>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Associates */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-charcoal">
          Associates ({bu.associateCount})
        </h2>
        <Table columns={associateColumns} data={bu.associates} emptyMessage="No associates." />
      </div>

      {editOpen && <EditDetailsModal bu={bu} onClose={() => setEditOpen(false)} onSaved={refresh} />}
      {addrOpen && <AddAddressModal buKey={bu.key} onClose={() => setAddrOpen(false)} onSaved={refresh} />}
    </div>
  );
}

function EditDetailsModal({
  bu,
  onClose,
  onSaved,
}: {
  bu: { key: string; name: string; contactEmail?: string };
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(bu.name);
  const [contactEmail, setContactEmail] = useState(bu.contactEmail ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/business-units/${bu.key}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, contactEmail }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to save');
      await onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Edit company details"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}
        <div>
          <Label htmlFor="bu-name">Name</Label>
          <Input id="bu-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="bu-email">Contact email</Label>
          <Input id="bu-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}

function AddAddressModal({
  buKey,
  onClose,
  onSaved,
}: {
  buKey: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<Address>({ country: 'US' });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update(field: keyof Address) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/business-units/${buKey}/addresses`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to add address');
      await onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add address');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Add address"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Add address'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {error && (
          <div className="col-span-2">
            <Alert tone="danger">{error}</Alert>
          </div>
        )}
        <div>
          <Label htmlFor="fn">First name</Label>
          <Input id="fn" onChange={update('firstName')} />
        </div>
        <div>
          <Label htmlFor="ln">Last name</Label>
          <Input id="ln" onChange={update('lastName')} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="co">Company</Label>
          <Input id="co" onChange={update('company')} />
        </div>
        <div>
          <Label htmlFor="sn">Street name</Label>
          <Input id="sn" onChange={update('streetName')} />
        </div>
        <div>
          <Label htmlFor="snum">Street number</Label>
          <Input id="snum" onChange={update('streetNumber')} />
        </div>
        <div>
          <Label htmlFor="pc">Postal code</Label>
          <Input id="pc" onChange={update('postalCode')} />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" onChange={update('city')} />
        </div>
        <div>
          <Label htmlFor="country">Country (ISO)</Label>
          <Input id="country" defaultValue="US" maxLength={2} onChange={update('country')} />
        </div>
        <div>
          <Label htmlFor="region">Region / State</Label>
          <Input id="region" onChange={update('region')} />
        </div>
      </div>
    </Modal>
  );
}
