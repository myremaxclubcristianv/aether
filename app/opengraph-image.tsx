import { ImageResponse } from 'next/og';

export const alt = 'AETHER — The Instagram for What You Actually Achieve';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 70px',
          backgroundColor: '#050507',
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(39, 39, 42, 0.45) 0%, rgba(5, 5, 7, 0.95) 75%)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          border: '1px solid #27272a',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 18px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(24, 24, 27, 0.8)',
              border: '1px solid #3f3f46',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '8px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: '#10b981',
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontFamily: 'monospace',
                letterSpacing: '0.25em',
                color: '#d4d4d8',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              THE SOCIAL LAYER FOR ACTION
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 14,
              fontFamily: 'monospace',
              letterSpacing: '0.15em',
              color: '#71717a',
            }}
          >
            aether.cristianvaduva.com
          </div>
        </div>

        {/* Center Brand & Core Value */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 84,
              fontWeight: 800,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#ffffff',
              lineHeight: 1,
            }}
          >
            AETHER
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 34,
              fontWeight: 300,
              color: '#a1a1aa',
              letterSpacing: '-0.02em',
              maxWidth: '900px',
              lineHeight: 1.3,
            }}
          >
            The Instagram for what you actually achieve.
          </div>
        </div>

        {/* Bottom Feature Badges & Platform Values */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '28px',
            borderTop: '1px solid #27272a',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {['PROOFS', 'FLEX SCORE', 'STREAKS', 'CIRCLE', 'PROGRESS'].map((pillar) => (
              <div
                key={pillar}
                style={{
                  display: 'flex',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  letterSpacing: '0.2em',
                  color: '#71717a',
                  fontWeight: 600,
                }}
              >
                {pillar}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 13,
              fontFamily: 'monospace',
              letterSpacing: '0.15em',
              color: '#10b981',
              fontWeight: 600,
            }}
          >
            PROOF OVER POPULARITY
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
