'use client';
import { useCallback, useMemo, useState } from 'react';
import { useApprovalRules, useApprovalRuleMutations } from '@/hooks/useApprovalRules';
import { useAssociateRoles } from '@/hooks/useAssociateRoles';
import { usePermissions } from '@/hooks/usePermissions';
import { Button, Card, Badge, Input, Label, Textarea, Select, Alert, EmptyState, Spinner } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { PredicateBuilder } from '@/components/approval-rules/PredicateBuilder';
import type { ApprovalRule } from '@/lib/types';
import type { ApprovalRuleInput } from '@/lib/ct/approvalRules';

export default function ApprovalRulesPage() {
  const { approvalRules, isLoading } = useApprovalRules();
  const { can } = usePermissions();
  const { deactivateRule } = useApprovalRuleMutations();
  const [editing, setEditing] = useState<ApprovalRule | null>(null);
  const [creating, setCreating] = useState(false);

  const canCreate = can('CreateApprovalRules');
  const canUpdate = can('UpdateApprovalRules');

  if (!canCreate && !canUpdate) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-charcoal">Approval rules</h1>
        {canCreate && <Button onClick={() => setCreating(true)}>New rule</Button>}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="text-terra" />
        </div>
      ) : approvalRules.length === 0 ? (
        <EmptyState
          title="No approval rules"
          description="Create a rule to require approval for orders that match a condition."
          action={canCreate ? <Button onClick={() => setCreating(true)}>New rule</Button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {approvalRules.map((rule) => (
            <Card key={rule.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium text-charcoal">{rule.name}</h2>
                    <Badge tone={rule.status === 'Active' ? 'success' : 'neutral'}>{rule.status}</Badge>
                  </div>
                  {rule.description && <p className="mt-1 text-sm text-charcoal-light">{rule.description}</p>}
                  <p className="mt-2 font-mono text-xs text-charcoal-light">{rule.predicate || '(matches all orders)'}</p>
                  <div className="mt-2 text-xs text-charcoal-light">
                    Requesters: {rule.requesterRoleKeys.join(', ') || '—'} · Approval tiers:{' '}
                    {rule.approverTiers.map((t) => `(${t.join(' or ')})`).join(' → ') || '—'}
                  </div>
                </div>
                {canUpdate && (
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(rule)}>
                      Edit
                    </Button>
                    {rule.status === 'Active' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Deactivate "${rule.name}"?`)) deactivateRule(rule.id);
                        }}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <RuleFormModal rule={editing} onClose={() => { setCreating(false); setEditing(null); }} />
      )}
    </div>
  );
}

function RuleFormModal({ rule, onClose }: { rule: ApprovalRule | null; onClose: () => void }) {
  const { roles } = useAssociateRoles();
  const { createRule, updateRule } = useApprovalRuleMutations();
  const roleKeys = useMemo(() => roles.map((r) => r.key), [roles]);

  const [name, setName] = useState(rule?.name ?? '');
  const [description, setDescription] = useState(rule?.description ?? '');
  const [status, setStatus] = useState<'Active' | 'Inactive'>(rule?.status ?? 'Active');
  const [predicate, setPredicate] = useState(rule?.predicate ?? '');
  const [requesters, setRequesters] = useState<string[]>(rule?.requesterRoleKeys ?? []);
  const [tiers, setTiers] = useState<string[][]>(rule?.approverTiers ?? [[]]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePredicate = useCallback((p: string) => setPredicate(p), []);

  function toggleRequester(key: string) {
    setRequesters((r) => (r.includes(key) ? r.filter((k) => k !== key) : [...r, key]));
  }
  function toggleTierRole(tierIdx: number, key: string) {
    setTiers((ts) =>
      ts.map((t, i) => (i === tierIdx ? (t.includes(key) ? t.filter((k) => k !== key) : [...t, key]) : t))
    );
  }

  async function save() {
    setError(null);
    if (!name.trim()) return setError('Name is required.');
    const cleanedTiers = tiers.filter((t) => t.length > 0);
    if (cleanedTiers.length === 0) return setError('Add at least one approval tier with a role.');
    if (requesters.length === 0) return setError('Select at least one requester role.');

    const input: ApprovalRuleInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      status,
      predicate,
      approverTiers: cleanedTiers,
      requesterRoleKeys: requesters,
    };
    setSaving(true);
    try {
      if (rule) await updateRule(rule.id, input);
      else await createRule(input);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={rule ? 'Edit approval rule' : 'New approval rule'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : rule ? 'Save changes' : 'Create rule'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}
        <div>
          <Label htmlFor="rule-name">Name</Label>
          <Input id="rule-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rule-desc">Description</Label>
          <Textarea id="rule-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="rule-status">Status</Label>
            <Select id="rule-status" value={status} onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>
        </div>

        <div>
          <Label>Conditions (predicate)</Label>
          <PredicateBuilder initialPredicate={rule?.predicate} onChange={handlePredicate} />
        </div>

        <div>
          <Label>Requester roles</Label>
          <p className="mb-2 text-xs text-charcoal-light">Orders created by these roles are checked against this rule.</p>
          <div className="flex flex-wrap gap-2">
            {roleKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleRequester(key)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  requesters.includes(key) ? 'border-terra bg-terra/10 text-charcoal' : 'border-border text-charcoal-light'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Approval tiers</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => setTiers((t) => [...t, []])}>
              + Add tier
            </Button>
          </div>
          <p className="mb-2 text-xs text-charcoal-light">
            Tiers approve in sequence. Within a tier, any selected role can approve.
          </p>
          <div className="space-y-2">
            {tiers.map((tier, i) => (
              <div key={i} className="rounded-md border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-charcoal">Tier {i + 1}</span>
                  {tiers.length > 1 && (
                    <button onClick={() => setTiers((ts) => ts.filter((_, idx) => idx !== i))} className="text-xs text-charcoal-light hover:text-red-600">
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {roleKeys.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleTierRole(i, key)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        tier.includes(key) ? 'border-sage bg-sage/10 text-charcoal' : 'border-border text-charcoal-light'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
