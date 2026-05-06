import { FC, ReactNode, CSSProperties } from 'react';

interface SectionProps {
  children: ReactNode;
  style?: CSSProperties;
  padding?: string;
}

export const Section: FC<SectionProps> = ({ 
  children, 
  style, 
  padding = '32px' 
}) => {
  return (
    <section
      style={{
        padding,
        color: '#23244C',
        ...style,
      }}
    >
      {children}
    </section>
  );
};
