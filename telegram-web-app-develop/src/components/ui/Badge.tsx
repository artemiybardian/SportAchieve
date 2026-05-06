import { FC, ReactNode, CSSProperties } from 'react';

interface BadgeProps {
  children: ReactNode;
  style?: CSSProperties;
  backgroundColor?: string;
  color?: string;
}

export const Badge: FC<BadgeProps> = ({ 
  children, 
  style, 
  backgroundColor = '#0FA948', 
  color = 'white' 
}) => {
  return (
    <span
      style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: '400',
        fontSize: '10px',
        backgroundColor,
        borderRadius: '6px',
        color,
        padding: '4px 7px',
        margin: '0 4px',
        ...style,
      }}
    >
      {children}
    </span>
  );
};
