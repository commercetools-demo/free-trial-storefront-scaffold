'use client';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { usePurchaseLists, usePurchaseListMutations } from '@/hooks/usePurchaseLists';
import { usePermissions } from '@/hooks/usePermissions';
import { Button, Card, Input, Label, Alert, EmptyState, Spinner } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';

export default function PurchaseListsPage() {
  const { purchaseLists, isLoading } = usePurchaseLists();
  const { createList, deleteList } = usePurchaseListMutations();
  const { can, hasAnyPermission } = usePermissions();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!hasAnyPermission(['ViewMyShoppingLists', 'ViewOthersShoppingLists'])) return null;
  const canCreate = can('CreateMyShoppingLists');
  const canDelete = can('DeleteMyShoppingLists');

  async function handleCreate() {
    if (!name.trim()) return setError('Name is required.');
    setSaving(true);
    setError(null);
    try {
      await createList(name.trim(), description.trim() || undefined);
      setCreating(false);
      setName('');
      setDescription('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create list');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-charcoal">Purchase lists</h1>
        {canCreate && <Button onClick={() => setCreating(true)}>New list</Button>}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="text-terra" />
        </div>
      ) : purchaseLists.length === 0 ? (
        <EmptyState
          title="No purchase lists"
          description="Create a shared list of products your business unit reorders frequently."
          action={canCreate ? <Button onClick={() => setCreating(true)}>New list</Button> : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {purchaseLists.map((list) => (
            <Card key={list.id} className="flex flex-col p-5">
              <Link href={`/dashboard/purchase-lists/${list.id}` as `/${string}`} className="font-medium text-charcoal hover:text-terra">
                {list.name}
              </Link>
              {list.description && <p className="mt-1 text-sm text-charcoal-light">{list.description}</p>}
              <p className="mt-2 text-sm text-charcoal-light">{list.itemCount} item{list.itemCount === 1 ? '' : 's'}</p>
              <div className="mt-4 flex gap-2">
                <Link href={`/dashboard/purchase-lists/${list.id}` as `/${string}`}>
                  <Button variant="outline" size="sm">
                    Open
                  </Button>
                </Link>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete "${list.name}"?`)) deleteList(list.id);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={creating}
        onClose={() => setCreating(false)}
        title="New purchase list"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating…' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <Alert tone="danger">{error}</Alert>}
          <div>
            <Label htmlFor="pl-name">Name</Label>
            <Input id="pl-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pl-desc">Description (optional)</Label>
            <Input id="pl-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
