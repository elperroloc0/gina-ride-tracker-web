import { useEffect, useMemo, useState } from 'react';
import { Avatar, Badge, Icon, Table, TableCell, TableHeader, TableRow, Timeline, WeekdayChips } from 'gina-ride-tracker-ds';
import { getArrivalEvents, getChildren, getGeoFences, getRoutes, getVans } from '../../api/client';
import type { ArrivalEventDTO, ChildDTO, GeoFenceDTO, RouteDTO, VanDTO } from '../../api/types';
import { deriveRideState, pickupDate, timelineSteps, type RideState } from '../../domain/rideStatus';
import { computeNextRide, todaysPickup } from '../../domain/schedule';
import { initialsOf } from '../../domain/initials';
import { AddParentForm } from './AddParentForm';
import { EditChildScheduleForm } from './EditChildScheduleForm';
import { ParentsPanel } from './ParentsPanel';

const REFRESH_MS = 30_000;

function isSameDay(iso: string, now: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

/**
 * The operator's full roster - every enrolled child, not just one parent's
 * (ChildViewSet.get_queryset() already returns everyone for an operator).
 * Each row also shows the parent's name/phone (ChildSerializer's
 * parent_name/parent_phone_number) as a quick "whose kid is this" glance.
 * Full parent account management (edit, deactivate, resend invite) is the
 * separate ParentsPanel section rendered below, in this same tab.
 */
export function ChildrenRoster() {
  const [children, setChildren] = useState<ChildDTO[]>([]);
  const [routes, setRoutes] = useState<RouteDTO[]>([]);
  const [geoFences, setGeoFences] = useState<GeoFenceDTO[]>([]);
  const [vans, setVans] = useState<VanDTO[]>([]);
  const [events, setEvents] = useState<ArrivalEventDTO[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);

  function refetchChildren() {
    getChildren().then(setChildren);
  }

  useEffect(() => {
    refetchChildren();
    getRoutes().then(setRoutes);
    getGeoFences().then(setGeoFences);
    getVans().then(setVans);
    getArrivalEvents().then(setEvents);
  }, []);

  // Ride state changes while the operator watches this screen (the webhook flips
  // ride_active), so re-poll instead of freezing everything at mount time.
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
      refetchChildren();
      getArrivalEvents().then(setEvents);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const vanById = useMemo(() => new Map(vans.map((v) => [v.id, v])), [vans]);
  const routeById = useMemo(() => new Map(routes.map((r) => [r.id, r])), [routes]);
  const geoFenceById = useMemo(() => new Map(geoFences.map((g) => [g.id, g])), [geoFences]);
  const selected = children.find((c) => c.id === selectedId) ?? null;

  if (adding) {
    return (
      <AddParentForm
        onCancel={() => setAdding(false)}
        onDone={() => {
          setAdding(false);
          refetchChildren();
        }}
      />
    );
  }

  if (editingSchedule && selected) {
    return (
      <EditChildScheduleForm
        child={selected}
        onCancel={() => setEditingSchedule(false)}
        onDone={() => {
          setEditingSchedule(false);
          refetchChildren();
        }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24, height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 24, letterSpacing: '-0.02em', textTransform: 'uppercase', flexGrow: 1 }}>
          Children
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          aria-label="Add a family"
          style={{
            width: 32,
            height: 32,
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

      {children.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>No children enrolled yet.</p>
      ) : (
        // flexShrink: 0 - .gds-table is overflow: hidden, so as a flex item it
        // may shrink below its content. Once a child is selected and the ride
        // panel appears, this column overflows and the table got squashed
        // (rows clipped) instead of the outer container scrolling.
        <div style={{ flexShrink: 0 }}>
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
                    <span style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {child.parent_name || child.parent_phone_number}
                      </div>
                    </span>
                  </TableCell>
                  <TableCell variant="schedule">
                    <WeekdayChips active={active} time={nextRide?.time} />
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </div>
      )}

      {selected ? (
        <RideProgress
          child={selected}
          route={routeById.get(selected.route)}
          van={vanById.get(routeById.get(selected.route)?.van ?? -1)}
          geoFenceById={geoFenceById}
          events={events}
          now={now}
          onEditSchedule={() => setEditingSchedule(true)}
        />
      ) : null}

      <ParentsPanel />
    </div>
  );
}

const STATE_BADGE: Record<RideState, { tone: 'now' | 'scheduled' | 'info'; label: string }> = {
  active: { tone: 'now', label: 'On ride' },
  completed: { tone: 'info', label: 'Completed' },
  scheduled: { tone: 'scheduled', label: 'Scheduled' },
  none: { tone: 'scheduled', label: 'No ride today' },
};

function RideProgress({
  child,
  route,
  van,
  geoFenceById,
  events,
  now,
  onEditSchedule,
}: {
  child: ChildDTO;
  route: RouteDTO | undefined;
  van: VanDTO | undefined;
  geoFenceById: Map<number, GeoFenceDTO>;
  events: ArrivalEventDTO[];
  now: Date;
  onEditSchedule: () => void;
}) {
  const origin = route ? geoFenceById.get(route.origin) : undefined;
  const destination = route ? geoFenceById.get(route.destination) : undefined;
  const pickup = todaysPickup(child.schedule, now);

  const state = deriveRideState({
    rideActive: child.ride_active,
    todaysPickup: pickup,
    destinationArrivals: route
      ? events
          .filter((e) => e.van === route.van && e.geo_fence === route.destination && e.arrival_type === 'in' && isSameDay(e.time, now))
          .map((e) => new Date(e.time))
      : [],
    now,
  });
  const badge = STATE_BADGE[state];
  const pickupLabel = pickup
    ? pickupDate(pickup, now).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null;
  // The label is optional: a route and a van plate explain themselves, a bare time doesn't.
  const detail = (value: string, label?: string) => (
    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
      {label ? `${label}: ` : null}
      <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{child.name}</div>
        <Badge tone={badge.tone} size="sm">
          {badge.label}
        </Badge>
        <div style={{ flexGrow: 1 }} />
        <button
          type="button"
          onClick={onEditSchedule}
          style={{
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-field)',
            background: 'transparent',
            color: 'var(--muted)',
            fontSize: 12,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          Edit ride
        </button>
      </div>

      {route ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {detail(`${origin?.name ?? '…'} \u2192 ${destination?.name ?? '…'}`)}
            {detail(van?.name ?? '…')}
            {pickupLabel ? detail(pickupLabel, 'Pickup today') : null}
          </div>
          <Timeline
            orientation="horizontal"
            steps={timelineSteps(state, origin?.name ?? 'the school', destination?.name ?? 'the gym')}
          />
        </>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>No route assigned.</p>
      )}
    </div>
  );
}
