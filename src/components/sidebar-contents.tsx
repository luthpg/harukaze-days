import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  // Home,
  CalendarDays,
  // Settings,
  // Palette
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { to: '/app', label: 'カレンダー', icon: CalendarDays },
  // 将来的な拡張例
  // { to: '/app/dashboard', label: 'ダッシュボード', icon: Home },
  // { to: '/app/settings', label: '設定', icon: Settings },
  // { to: '/app/theme', label: 'テーマ設定', icon: Palette },
];

interface SidebarNavContentProps {
  onLinkClick?: () => void;
}

export function SidebarNavContent({ onLinkClick }: SidebarNavContentProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8 p-4 border-b">
        {' '}
        {/* ヘッダー部分を少し調整 */}
        <Link to="/" className="flex items-center gap-2" onClick={onLinkClick}>
          <CalendarDays className="h-8 w-8 text-primary" />{' '}
          {/* 仮のロゴアイコン */}
          <h1 className="text-xl font-bold text-primary">Date Logger</h1>
        </Link>
      </div>
      <nav className="flex flex-col gap-1 px-4 py-2 flex-1">
        {' '}
        {/* gapとpaddingを微調整 */}
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant={currentPath === item.to ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start text-md h-10', // 高さを固定
              currentPath === item.to
                ? 'font-semibold text-primary'
                : 'text-foreground/70 hover:text-foreground',
            )}
            asChild
            onClick={onLinkClick}
          >
            <Link to={item.to}>
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
