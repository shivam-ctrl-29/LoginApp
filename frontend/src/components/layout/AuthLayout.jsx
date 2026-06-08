import React from 'react';
import { Building2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

const AuthLayout = ({ children, title, subtitle }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: theme.colors.bgGradient,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative orbs */}
      <div className="auth-orb auth-orb-1" style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.colors.accent}18, transparent 70%)`,
        top: -100,
        right: -100,
        pointerEvents: 'none',
      }} />
      <div className="auth-orb auth-orb-2" style={{
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.colors.blue}25, transparent 70%)`,
        bottom: -80,
        left: -80,
        pointerEvents: 'none',
      }} />

      {/* Left branding panel - desktop only */}
      <div className="auth-brand-panel" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 60,
        position: 'relative',
      }}>
        <div style={{ maxWidth: 440 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.blue})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 32px ${theme.colors.accent}40`,
            }}>
              <Building2 size={28} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: theme.colors.text, letterSpacing: '-0.03em' }}>
                i-SOFTZONE
              </div>
              <div style={{ fontSize: 12, color: theme.colors.accent, fontWeight: 700, letterSpacing: '0.15em' }}>
                HUMAN RESOURCE MANAGEMENT
              </div>
            </div>
          </div>
          <h1 style={{
            fontSize: 42,
            fontWeight: 800,
            color: theme.colors.text,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 16px',
          }}>
            Enterprise HR,<br />
            <span style={{ color: theme.colors.accent }}>Reimagined.</span>
          </h1>
          <p style={{
            fontSize: 16,
            color: theme.colors.textSecondary,
            lineHeight: 1.7,
            margin: 0,
          }}>
            Streamline workforce management, leave tracking, and employee lifecycle
            with a platform built for modern enterprises.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: '0 0 auto',
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 32px',
        position: 'relative',
      }}>
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            width: 40,
            height: 40,
            borderRadius: 10,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.glass,
            backdropFilter: 'blur(12px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.text,
          }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div
          className="auth-card-enter"
          style={{
            background: theme.colors.glass,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${theme.colors.glassBorder}`,
            borderRadius: 24,
            padding: '40px 36px',
            boxShadow: theme.colors.glassShadow,
          }}
        >
          {title && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                margin: '0 0 6px',
                fontSize: 26,
                fontWeight: 800,
                color: theme.colors.text,
                letterSpacing: '-0.02em',
              }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{ margin: 0, fontSize: 14, color: theme.colors.textSecondary }}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
