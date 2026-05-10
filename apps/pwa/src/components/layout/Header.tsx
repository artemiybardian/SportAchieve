import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/providers/ThemeProvider';

interface HeaderProps {
  name: string;
  avatarUrl: string;
  daysLeft: number;
  hasSubscription?: boolean;
}

export function Header({ name, avatarUrl, daysLeft, hasSubscription }: HeaderProps) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const displayName = name.trim();
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <header className="header-gradient flex items-center justify-between gap-2 px-4 sm:px-5 py-4 rounded-b-3xl shadow-lg min-w-0">
      <button
        className="flex items-center gap-3 min-w-0 flex-1 text-left"
        onClick={() => navigate('/user')}
      >
        <div className="flex-shrink-0 border-2 border-[hsl(var(--brand-cyan)/0.6)] rounded-full p-0.5">
          {avatarUrl ? (
            <img
              className="rounded-full object-cover"
              height={36}
              width={36}
              src={avatarUrl}
              alt={displayName || 'Профиль'}
            />
          ) : (
            <div
              className="rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ height: 36, width: 36, backgroundColor: 'hsl(var(--brand-cyan) / 0.25)' }}
            >
              {initial}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-white/70 text-xs font-medium leading-none mb-0.5">Привет,</p>
          <p className="text-white font-semibold text-sm leading-tight truncate">
            {displayName || 'Спортсмен'}
          </p>
        </div>

        {hasSubscription && (
          <Badge variant="pro" className="text-xs flex-shrink-0">
            PRO · {daysLeft} дн.
          </Badge>
        )}
      </button>

      <button
        onClick={toggle}
        className="flex-shrink-0 ml-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        style={{ backgroundColor: 'hsl(var(--brand-cyan) / 0.15)' }}
        aria-label="Переключить тему"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-[hsl(var(--brand-cyan))]" />
        ) : (
          <Moon className="h-4 w-4 text-white/80" />
        )}
      </button>
    </header>
  );
}
