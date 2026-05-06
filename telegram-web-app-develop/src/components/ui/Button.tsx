import { FC, ReactNode, CSSProperties, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | "activeTab";
  children: ReactNode;
  fullWidth?: boolean;
}

export const Button: FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  style, 
  fullWidth = false,
  ...props 
}) => {
  const baseStyle: CSSProperties = {
    border: 'none',
    borderRadius: '64px',
    height: '64px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Codec Cold Logo, sans-serif',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: fullWidth ? '100%' : 'auto',
    padding: '0 32px', // Default horizontal padding
    transition: 'opacity 0.2s',
    ...style,
  };

  const variants: Record<string, CSSProperties> = {
    primary: {
      backgroundColor: '#68C6E0',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#E6E9ED',
      color: '#23244C',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#6A708B',
      fontWeight: '400',
      fontFamily: 'SF Pro Display, sans-serif',
      fontSize: '16px',
      padding: '6px 16px',
      height: 'auto',
      borderRadius: '31px',
    },
    activeTab: {
      color: "#ffffff",
      backgroundColor: "#23244C",
      padding: "6px 16px",
      height: '32px',
      fontFamily: "SF Pro Display",
      fontWeight: "400",
      fontSize: "16px"
    }
  };

  return (
    <button style={{ ...baseStyle, ...variants[variant] }} {...props}>
      {children}
    </button>
  );
};
