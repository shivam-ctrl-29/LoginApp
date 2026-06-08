import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export const FloatingInput = ({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  icon: Icon,
  style = {},
  ...rest
}) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';

  return (
    <div style={{ position: 'relative', marginBottom: 20, ...style }}>
      {Icon && (
        <Icon
          size={18}
          style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            color: focused ? theme.colors.accent : theme.colors.textMuted,
            transition: 'color 0.2s',
            zIndex: 1,
          }}
        />
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: Icon ? '16px 16px 16px 48px' : '16px 16px 16px 16px',
          paddingTop: 22,
          borderRadius: 12,
          border: `1.5px solid ${focused ? theme.colors.accent : theme.colors.border}`,
          background: theme.colors.inputBg,
          color: theme.colors.text,
          fontSize: 15,
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'all 0.25s ease',
          boxSizing: 'border-box',
          boxShadow: focused ? `0 0 0 3px ${theme.colors.accent}22` : 'none',
        }}
        {...rest}
      />
      <label
        style={{
          position: 'absolute',
          left: Icon ? 48 : 16,
          top: focused || hasValue ? 8 : '50%',
          transform: focused || hasValue ? 'none' : 'translateY(-50%)',
          fontSize: focused || hasValue ? 11 : 15,
          fontWeight: focused || hasValue ? 600 : 400,
          color: focused ? theme.colors.accent : theme.colors.textMuted,
          transition: 'all 0.2s ease',
          pointerEvents: 'none',
          letterSpacing: focused || hasValue ? '0.04em' : 'normal',
          textTransform: focused || hasValue ? 'uppercase' : 'none',
        }}
      >
        {label}{required && ' *'}
      </label>
    </div>
  );
};

export const FloatingSelect = ({ label, value, onChange, children, required, style = {} }) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';

  return (
    <div style={{ position: 'relative', marginBottom: 20, ...style }}>
      <select
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '22px 16px 12px',
          borderRadius: 12,
          border: `1.5px solid ${focused ? theme.colors.accent : theme.colors.border}`,
          background: theme.colors.inputBg,
          color: theme.colors.text,
          fontSize: 15,
          fontFamily: 'inherit',
          outline: 'none',
          appearance: 'none',
          cursor: 'pointer',
          boxSizing: 'border-box',
          boxShadow: focused ? `0 0 0 3px ${theme.colors.accent}22` : 'none',
        }}
      >
        {children}
      </select>
      <label
        style={{
          position: 'absolute',
          left: 16,
          top: focused || hasValue ? 8 : '50%',
          transform: focused || hasValue ? 'none' : 'translateY(-50%)',
          fontSize: focused || hasValue ? 11 : 15,
          fontWeight: focused || hasValue ? 600 : 400,
          color: focused ? theme.colors.accent : theme.colors.textMuted,
          transition: 'all 0.2s ease',
          pointerEvents: 'none',
          letterSpacing: focused || hasValue ? '0.04em' : 'normal',
          textTransform: focused || hasValue ? 'uppercase' : 'none',
        }}
      >
        {label}{required && ' *'}
      </label>
    </div>
  );
};

export const FloatingTextarea = ({ label, value, onChange, rows = 4, required, style = {} }) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';

  return (
    <div style={{ position: 'relative', marginBottom: 20, ...style }}>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '22px 16px 12px',
          borderRadius: 12,
          border: `1.5px solid ${focused ? theme.colors.accent : theme.colors.border}`,
          background: theme.colors.inputBg,
          color: theme.colors.text,
          fontSize: 15,
          fontFamily: 'inherit',
          outline: 'none',
          resize: 'vertical',
          minHeight: 100,
          boxSizing: 'border-box',
          boxShadow: focused ? `0 0 0 3px ${theme.colors.accent}22` : 'none',
        }}
      />
      <label
        style={{
          position: 'absolute',
          left: 16,
          top: focused || hasValue ? 8 : 20,
          fontSize: focused || hasValue ? 11 : 15,
          fontWeight: focused || hasValue ? 600 : 400,
          color: focused ? theme.colors.accent : theme.colors.textMuted,
          transition: 'all 0.2s ease',
          pointerEvents: 'none',
          letterSpacing: focused || hasValue ? '0.04em' : 'normal',
          textTransform: focused || hasValue ? 'uppercase' : 'none',
        }}
      >
        {label}{required && ' *'}
      </label>
    </div>
  );
};

export default FloatingInput;
