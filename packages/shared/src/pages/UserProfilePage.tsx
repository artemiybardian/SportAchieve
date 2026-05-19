import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, HeadphonesIcon, Info, LogOut, ChevronRight } from 'lucide-react';
import { Page } from '@/components/layout/Page';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { UserSubscriptionSheet } from '@/features/subscriptions/components/UserSubscriptionSheet';
import { useUser, useResetOnboarding } from '@/features/user/api/use-user';
import { useLogout } from '@/features/auth/api/use-auth';
import { AnalyticsLogger } from '@/services/AnalyticsLogger';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { peekLastBrowsePath } from '@/lib/last-browse-path';
import { getSubscriptionBadgeDisplay } from '@/lib/subscription-display';

interface MenuItemProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  onClick?: () => void | Promise<void>;
  danger?: boolean;
  disabled?: boolean;
}

function MenuItem({ icon, iconBg, label, onClick, danger, disabled }: MenuItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`w-full flex items-center gap-4 py-4 px-3 hover:bg-accent/60 rounded-xl transition-colors btn-press text-left disabled:pointer-events-none disabled:opacity-50 ${
        danger ? 'text-destructive' : 'text-foreground'
      }`}
      onClick={onClick}
    >
      <div
        className="rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ width: 40, height: 40, backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <span className="font-medium flex-1">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
    </button>
  );
}

export function UserProfilePage() {
  const { me, subscription, fullName, avatarUrl, daysLeft } = useUser();
  const subBadge = subscription ? getSubscriptionBadgeDisplay(subscription) : null;
  const [subSheetOpen, setSubSheetOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const { toast } = useToast();
  const resetOnboarding = useResetOnboarding();

  useEffect(() => {
    void AnalyticsLogger.logUserProfileView();
  }, []);

  return (
    <Page back>
      {/* Avatar & name */}
      <div className="flex flex-col items-center px-6 pt-6 pb-6 gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow-md"
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
            style={{ background: 'linear-gradient(135deg, hsl(var(--brand-navy)) 0%, hsl(238 50% 35%) 100%)' }}
          >
            {fullName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">{fullName}</h1>
          {me?.email ? (
            <p className="text-sm text-muted-foreground mt-0.5">{me.email}</p>
          ) : null}
        </div>
      </div>

      {/* Subscription card */}
      {subscription && (
        <div className="px-4 pb-4">
          <button
            className="w-full bg-card border border-border rounded-2xl p-4 flex justify-between items-center hover:bg-accent/40 transition-colors btn-press text-left shadow-sm"
            onClick={() => setSubSheetOpen(true)}
          >
            <div>
              <p className="font-semibold text-foreground">Подписка</p>
              <Badge variant={subBadge?.variant ?? 'secondary'} className="mt-1.5">
                {subBadge?.label ?? '—'}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-sm">{daysLeft} дней</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      {/* Menu */}
      <div className="px-4 pb-2">
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <MenuItem
            icon={<HeadphonesIcon className="h-5 w-5 text-white" />}
            iconBg="hsl(var(--brand-cyan))"
            label="Поддержка"
            onClick={() => {
              void AnalyticsLogger.logSupportClick();
              window.open('https://t.me/i_nikmak', '_blank');
            }}
          />
          <Separator className="mx-4 w-auto" />
          <MenuItem
            icon={<Info className="h-5 w-5 text-white" />}
            iconBg="hsl(var(--muted-foreground) / 0.5)"
            label="О приложении"
            onClick={() =>
              toast({
                title: 'SportAchieve',
                description: 'Версия 1.0 · Приложение для работы с тренажёрами в зале',
              })
            }
          />
          <Separator className="mx-4 w-auto" />
          <MenuItem
            icon={<RotateCcw className="h-5 w-5 text-white" />}
            iconBg="hsl(var(--muted-foreground) / 0.5)"
            label="Повторить онбординг"
            disabled={resetOnboarding.isPending}
            onClick={async () => {
              const back = peekLastBrowsePath() ?? '/exercise/machine';
              try {
                await resetOnboarding.mutateAsync();
              } catch {
                toast({
                  title: 'Не удалось сбросить онбординг',
                  description: 'Проверьте сеть и попробуйте снова.',
                  variant: 'destructive',
                });
                return;
              }
              navigate(`/onboarding?next=${encodeURIComponent(back)}`);
            }}
          />
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pt-3 pb-8">
        <Button
          variant="outline"
          className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive btn-press"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Выйти
        </Button>
      </div>

      <UserSubscriptionSheet open={subSheetOpen} onOpenChange={setSubSheetOpen} />
    </Page>
  );
}
