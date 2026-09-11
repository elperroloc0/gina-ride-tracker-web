import { useEffect, useState } from 'react';
import { Badge } from 'gina-ride-tracker-ds';
import { getGeoFences, getRoutes, getVans } from '../../api/client';
import type { GeoFenceDTO, RouteDTO, VanDTO } from '../../api/types';

/**
 * Flat, read-only lists - route/geofence editing is Django-admin territory
 * per architecture-plan.md; building a second admin here would be scope
 * creep. Geofence "active" state is shown with a Badge rather than the DS
 * Toggle: Toggle looks and behaves like a real control (it fires onClick),
 * and a switch that appears clickable but does nothing is worse than no
 * switch at all.
 */
export function RoutesPanel() {
  const [routes, setRoutes] = useState<RouteDTO[]>([]);
  const [geoFences, setGeoFences] = useState<GeoFenceDTO[]>([]);
  const [vans, setVans] = useState<VanDTO[]>([]);

  useEffect(() => {
    getRoutes().then(setRoutes);
    getGeoFences().then(setGeoFences);
    getVans().then(setVans);
  }, []);

  const geoFenceName = (id: number) => geoFences.find((g) => g.id === id)?.name ?? `#${id}`;
  const vanName = (id: number) => vans.find((v) => v.id === id)?.name ?? `#${id}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 24, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
        Routes &amp; zones
      </div>

      <section>
        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)', marginBottom: 10 }}>
          Routes
        </div>
        {routes.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>No routes yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {routes.map((route) => (
              <div key={route.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-row)', padding: '12px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {geoFenceName(route.origin)} &rarr; {geoFenceName(route.destination)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{vanName(route.van)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)', marginBottom: 10 }}>
          Geofences
        </div>
        {geoFences.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>No geofences yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {geoFences.map((g) => (
              <div
                key={g.id}
                style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-row)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {g.location_type === 'SCHOOL' ? 'School' : 'Gym'} &middot; {g.radius}m radius
                  </div>
                </div>
                <Badge tone={g.is_active ? 'now' : 'scheduled'}>{g.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
