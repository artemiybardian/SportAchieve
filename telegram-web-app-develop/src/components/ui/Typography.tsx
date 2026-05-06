import { FC, ReactNode, CSSProperties } from 'react';

interface TypographyProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export const Heading: FC<TypographyProps & { level?: 1 | 2 | 3 }> = ({ children, level = 1, style, className }) => {
  const baseStyle: CSSProperties = {
    fontFamily: 'Sora, sans-serif',
    fontWeight: '700',
    color: '#23244C',
    ...style,
  };

  switch (level) {
    case 1:
      return <h1 style={{ fontSize: '32px', margin: 0, ...baseStyle }} className={className}>{children}</h1>;
    case 2:
      return <h2 style={{ fontSize: '24px', margin: 0, ...baseStyle }} className={className}>{children}</h2>;
    case 3:
      return <h3 style={{ fontSize: '18px', margin: 0, ...baseStyle }} className={className}>{children}</h3>;
    default:
      return <h1 style={{ fontSize: '32px', margin: 0, ...baseStyle }} className={className}>{children}</h1>;
  }
};

export const Text: FC<TypographyProps & { size?: 'normal' | 'small', weight?: '400' | '700' }> = ({ 
  children, 
  size = 'normal', 
  weight = '400',
  style, 
  className 
}) => {
  const baseStyle: CSSProperties = {
    fontFamily: 'SF Pro Display, sans-serif',
    fontWeight: weight,
    fontSize: size === 'small' ? '14px' : '16px',
    color: '#23244C',
    ...style,
  };

  return <div style={baseStyle} className={className}>{children}</div>;
};

export const SoraText: FC<TypographyProps & { size?: string, weight?: string }> = ({
    children,
    size = '16px',
    weight = '400',
    style,
    className
}) => {
    const baseStyle: CSSProperties = {
        fontFamily: 'Sora, sans-serif',
        fontWeight: weight,
        fontSize: size,
        color: '#23244C',
        ...style,
    };

    return <div style={baseStyle} className={className}>{children}</div>;
};
