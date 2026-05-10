import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageProps {
  children: ReactNode;
  back?: boolean;
}

export function Page({ children, back = false }: PageProps) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-background page-transition overflow-x-hidden">
      {back && (
        <div className="px-3 pt-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors btn-press"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </button>
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}
