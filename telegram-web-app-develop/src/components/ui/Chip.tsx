import { FC, CSSProperties, ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  style?: CSSProperties;
}

export const Chip: FC<ChipProps> = ({ children, style }) => {
  return (
    <div
      style={{
        color: '#23244C',
        backgroundColor: '#68C6E029',
        borderRadius: '25px',
        padding: '4px 10px',
        marginRight: '4px',
        marginTop: '4px',
        height: '25px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontFamily: 'SF Pro Display, sans-serif',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const ChipGroup: FC<{ children: ReactNode; style?: CSSProperties }> = ({ children, style }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', ...style }}>
    {children}
  </div>
);
