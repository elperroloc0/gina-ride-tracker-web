/**
 * Stand-in basemap, styled to the palette in DESIGN-SYSTEM.md ("Цвета карты
 * (заглушка вместо Mapbox)"). Renders whenever `hasMapboxToken` is false, so
 * the app has something other than a broken map while no token is configured.
 */
export function MapPlaceholder() {
  return (
    <svg
      viewBox="0 0 390 700"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="390" height="700" fill="#E9E9E4" />
      <rect x="20" y="30" width="160" height="140" rx="6" fill="#F2F2EE" />
      <rect x="210" y="30" width="160" height="140" rx="6" fill="#F2F2EE" />
      <rect x="20" y="200" width="160" height="160" rx="6" fill="#E4EBE2" />
      <rect x="210" y="200" width="160" height="160" rx="6" fill="#F2F2EE" />
      <rect x="20" y="390" width="160" height="150" rx="6" fill="#F2F2EE" />
      <rect x="210" y="390" width="160" height="150" rx="6" fill="#F2F2EE" />
      <rect x="20" y="570" width="350" height="110" rx="6" fill="#F2F2EE" />
      <g stroke="#FFFFFF" strokeLinecap="round">
        <path d="M0 190h390" strokeWidth={10} />
        <path d="M0 380h390" strokeWidth={10} />
        <path d="M0 560h390" strokeWidth={10} />
        <path d="M195 0v700" strokeWidth={8} />
        <path d="M0 90h390" strokeWidth={4} />
        <path d="M0 290h390" strokeWidth={4} />
        <path d="M0 480h390" strokeWidth={4} />
        <path d="M100 0v700" strokeWidth={4} />
        <path d="M290 0v700" strokeWidth={4} />
      </g>
      <circle cx="110" cy="540" r="60" fill="none" stroke="#6E6E73" strokeOpacity={0.4} strokeWidth={1.6} strokeDasharray="6 5" />
      <circle cx="280" cy="150" r="54" fill="none" stroke="#6E6E73" strokeOpacity={0.4} strokeWidth={1.6} strokeDasharray="6 5" />
    </svg>
  );
}
