import type { ReactNode } from 'react';

/**
 * The parent-facing app is a phone screen: the artboards are 390px wide and the
 * control sizes assume a thumb, not a mouse. On a desktop window that layout has
 * to stay a phone-width column rather than stretch - a 1350px-wide text field is
 * not a bigger version of the design, it is a different and worse one.
 *
 * The operator console is the opposite case (its artboards are 1440px and the
 * table wants every pixel), which is why this is a layer the parent screens opt
 * into rather than something applied to the whole app.
 */
export default function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', background: 'var(--fill)' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          minHeight: '100vh',
          background: 'var(--bg)',
          // Only shows once the viewport is wider than the column, which is
          // exactly when the column needs an edge to read as a screen.
          boxShadow: '0 0 0 1px var(--line)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
