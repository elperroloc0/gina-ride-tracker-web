import { useEffect, useMemo, useState } from 'react';
import { Avatar, Table, TableCell, TableHeader, TableRow, Timeline, WeekdayChips } from 'gina-ride-tracker-ds';
import { getArrivalEvents, getChildren, getGeoFences, getRoutes } from '../../api/client';
import type { ArrivalEventDTO, ChildDTO, GeoFenceDTO, RouteDTO } from '../../api/types';
import { computeNextRide } from '../../domain/schedule';
import { initialsOf } from '../../domain/initials';

function isSameDay(iso: string, now: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

/**
 * The operator's full roster - every enrolled child, not just one parent's
 * (ChildViewSet.get_queryset() already returns everyone for an operator).
 * Rows show the child and schedule only: ChildSerializer doesn't expose the
 * parent's name (only their id), and adding that is a backend change outside
 * this phase's scope.
 */
export function ChildrenRoster() {
  const [children, setChildren] = useState<ChildDTO[]>([]);
  const [routes, setRoutes] = useState<RouteDTO[]>([]);
  const [geoFences, setGeoFences] = useState<GeoFenceDTO[]>([]);
  const [events, setEvents] = useState<ArrivalEventDTO[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    getChildren().then(setChildren);
    getRoutes().then(setRoutes);
    getGeoFences().then(setGeoFences);
    getArrivalEvents().then(setEvents);
  }, []);

  const now = useMemo(() => new Date(), []);
  const routeById = useMemo(() => new Map(routes.map((r) => [r.id, r])), [routes]);
  const geoFenceById = useMemo(() => new Map(geoFences.map((g) => [g.id, g])), [geoFences]);
  const selected = children.find((c) => c.id === selectedId) ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24, height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 24, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
        Children
      </div>

      {children.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>No children enrolled yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableCell grow={2}>Child</TableCell>
            <TableCell variant="schedule">Schedule</TableCell>
          </TableHeader>
          {children.map((child) => {
            const nextRide = computeNextRide(child.schedule, now);
            // computeNextRide's activeDays run Sun..Sat; WeekdayChips wants Mon..Fri, so [1..5].
            const active = nextRide ? nextRide.activeDays.slice(1, 6) : [false, false, false, false, false];
            return (
              <TableRow
                key={child.id}
                selected={child.id === selectedId}
                onClick={() => setSelectedId(child.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedId(child.id);
                }}
                style={{ cursor: 'pointer' }}
              >
                <TableCell grow={2} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar
                    initials={initialsOf(child.name)}
                    size={32}
                    state={child.id === selectedId ? 'selected' : 'default'}
                    style={{ flexShrink: 0 }}
                  />
                  {/* TableCell's own text-overflow CSS only applies to a plain text node -
                      putting an Avatar beside the name (via the inline flex style above)
                      needs the ellipsis moved onto the name span itself. */}
                  <span style={{ minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {child.name}
                  </span>
                </TableCell>
                <TableCell variant="schedule">
                  <WeekdayChips active={active} time={nextRide?.time} />
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
      )}

      {selected ? (
        <RideProgress child={selected} route={routeById.get(selected.route)} geoFenceById={geoFenceById} events={events} now={now} />
      ) : null}
    </div>
  );
}

function RideProgress({
  child,
  route,
  geoFenceById,
  events,
  now,
}: {
  child: ChildDTO;
  route: RouteDTO | undefined;
  geoFenceById: Map<number, GeoFenceDTO>;
  events: ArrivalEventDTO[];
  now: Date;
}) {
  if (!route) return null;
  const origin = geoFenceById.get(route.origin);
  const destination = geoFenceById.get(route.destination);

  const enteredToday = (geoFenceId: number) =>
    events.some((e) => e.van === route.van && e.geo_fence === geoFenceId && e.arrival_type === 'in' && isSameDay(e.time, now));

  const enteredOrigin = enteredToday(route.origin);
  const enteredDestination = enteredToday(route.destination);

  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{child.name}&rsquo;s ride today</div>
      <Timeline
        orientation="horizontal"
        steps={[
          { label: `Picked up at ${origin?.name ?? 'the school'}`, state: enteredOrigin ? 'done' : 'future' },
          {
            label: 'On the way to the gym',
            state: enteredOrigin && !enteredDestination ? 'current' : enteredDestination ? 'done' : 'future',
          },
          { label: `Arrives at ${destination?.name ?? 'the gym'}`, state: enteredDestination ? 'done' : 'future' },
        ]}
      />
    </div>
  );
}
