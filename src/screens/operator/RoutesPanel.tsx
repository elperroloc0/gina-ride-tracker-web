import { useEffect, useState } from 'react';
import { Badge, Icon } from 'gina-ride-tracker-ds';
import { deleteGeoFence, deleteRoute, deleteVan, getGeoFences, getRoutes, getVans, ApiError } from '../../api/client';
import type { GeoFenceDTO, RouteDTO, VanDTO } from '../../api/types';
import { GeoFenceForm } from './GeoFenceForm';
import { RouteForm } from './RouteForm';
import { VanForm } from './VanForm';

type Editing =
  | { kind: 'van'; item?: VanDTO }
  | { kind: 'geofence'; item?: GeoFenceDTO }
  | { kind: 'route'; item?: RouteDTO };

/**
 * Full CRUD for vans, geofences, and routes - reversing a prior read-only
 * decision (this used to be Django-admin-only). Geofence create/edit goes
 * through the backend's Traccar auto-provisioning (see GeoFenceViewSet), so
 * a 400 here can mean that server-to-server call failed, not just a plain
 * validation error - see GeoFenceForm's own doc comment.
 */
export function RoutesPanel() {
  const [routes, setRoutes] = useState<RouteDTO[]>([]);
  const [geoFences, setGeoFences] = useState<GeoFenceDTO[]>([]);
  const [vans, setVans] = useState<VanDTO[]>([]);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  function refetch() {
    getRoutes().then(setRoutes);
    getGeoFences().then(setGeoFences);
    getVans().then(setVans);
  }

  useEffect(refetch, []);

  const geoFenceName = (id: number) => geoFences.find((g) => g.id === id)?.name ?? `#${id}`;
  const vanName = (id: number) => vans.find((v) => v.id === id)?.name ?? `#${id}`;

  function closeForm() {
    setEditing(null);
  }

  function saved() {
    setEditing(null);
    refetch();
  }

  async function onDeleteVan(van: VanDTO) {
    if (!window.confirm(`Delete van ${van.name}?`)) return;
    setRowError(null);
    try {
      await deleteVan(van.id);
      refetch();
    } catch (err) {
      setRowError(err instanceof ApiError ? (err.detail ?? 'Could not delete this van.') : 'Could not delete this van.');
    }
  }

  async function onDeleteGeoFence(fence: GeoFenceDTO) {
    if (!window.confirm(`Delete geofence ${fence.name}?`)) return;
    setRowError(null);
    try {
      await deleteGeoFence(fence.id);
      refetch();
    } catch (err) {
      setRowError(err instanceof ApiError ? (err.detail ?? 'Could not delete this geofence.') : 'Could not delete this geofence.');
    }
  }

  async function onDeleteRoute(route: RouteDTO) {
    if (!window.confirm('Delete this route?')) return;
    setRowError(null);
    try {
      await deleteRoute(route.id);
      refetch();
    } catch (err) {
      setRowError(err instanceof ApiError ? (err.detail ?? 'Could not delete this route.') : 'Could not delete this route.');
    }
  }

  if (editing?.kind === 'van') {
    return <VanForm initial={editing.item} onDone={saved} onCancel={closeForm} />;
  }
  if (editing?.kind === 'geofence') {
    return <GeoFenceForm initial={editing.item} onDone={saved} onCancel={closeForm} />;
  }
  if (editing?.kind === 'route') {
    return <RouteForm initial={editing.item} onDone={saved} onCancel={closeForm} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 24, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
        Routes &amp; zones
      </div>

      {rowError ? (
        <div role="alert" style={{ display: 'flex' }}>
          <Badge tone="alert">{rowError}</Badge>
        </div>
      ) : null}

      <section>
        <SectionHeader label="Routes" onAdd={() => setEditing({ kind: 'route' })} />
        {routes.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>No routes yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {routes.map((route) => (
              <Row key={route.id} onEdit={() => setEditing({ kind: 'route', item: route })} onDelete={() => onDeleteRoute(route)}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {geoFenceName(route.origin)} &rarr; {geoFenceName(route.destination)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{vanName(route.van)}</div>
              </Row>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader label="Geofences" onAdd={() => setEditing({ kind: 'geofence' })} />
        {geoFences.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>No geofences yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {geoFences.map((g) => (
              <Row key={g.id} onEdit={() => setEditing({ kind: 'geofence', item: g })} onDelete={() => onDeleteGeoFence(g)}>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {g.location_type === 'SCHOOL' ? 'School' : 'Gym'} &middot; {g.radius}m radius
                  </div>
                </div>
                <Badge tone={g.is_active ? 'now' : 'scheduled'}>{g.is_active ? 'Active' : 'Inactive'}</Badge>
              </Row>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader label="Vans" onAdd={() => setEditing({ kind: 'van' })} />
        {vans.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>No vans yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {vans.map((van) => (
              <Row key={van.id} onEdit={() => setEditing({ kind: 'van', item: van })} onDelete={() => onDeleteVan(van)}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{van.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>IMEI {van.tracker_imei}</div>
              </Row>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeader({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)', flexGrow: 1 }}>
        {label}
      </div>
      <button
        type="button"
        onClick={onAdd}
        aria-label={`Add ${label.toLowerCase()}`}
        style={{
          width: 26,
          height: 26,
          borderRadius: '999px',
          border: 'none',
          cursor: 'pointer',
          background: 'var(--ink)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}

function Row({ children, onEdit, onDelete }: { children: React.ReactNode; onEdit: () => void; onDelete: () => void }) {
  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-row)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 12 }}>{children}</div>
      <button type="button" onClick={onEdit} aria-label="Edit" style={rowButtonStyle}>
        <Icon name="pencil" size={16} />
      </button>
      <button type="button" onClick={onDelete} aria-label="Delete" style={{ ...rowButtonStyle, fontSize: 16, lineHeight: 1 }}>
        &times;
      </button>
    </div>
  );
}

const rowButtonStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: '999px',
  border: '1px solid var(--line)',
  cursor: 'pointer',
  background: 'transparent',
  color: 'var(--muted)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};
