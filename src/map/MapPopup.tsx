import type { ReactNode } from 'react';
import { Popup } from '@vis.gl/react-mapbox';

type Props = {
  longitude: number;
  latitude: number;
  onClose: () => void;
  children: ReactNode;
};

/** No DS Popup/Tooltip primitive exists - hand-built like MapMarker/VanSprite,
 * styled with the same surface/shadow/radius tokens as VanMap's own floating
 * "Vans" card so it reads as native chrome rather than Mapbox's default popup. */
export function MapPopup({ longitude, latitude, onClose, children }: Props) {
  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      onClose={onClose}
      closeOnClick={false}
      offset={16}
      className="gina-map-popup"
    >
      {/* mapbox-gl.css's own .mapboxgl-popup-content already draws a white
          rounded card with padding/shadow - this app has exactly one global
          stylesheet (see main.tsx's comment) and this popup is the one place
          that needs to override a third-party one, so the override is scoped
          here via the className above rather than adding a second global file. */}
      <style>{`
        .gina-map-popup .mapboxgl-popup-content {
          background: transparent;
          padding: 0;
          box-shadow: none;
          border-radius: 0;
        }
      `}</style>
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--r-card)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.16)',
          padding: 14,
          minWidth: 160,
          fontSize: 13,
          color: 'var(--ink)',
        }}
      >
        {children}
      </div>
    </Popup>
  );
}
