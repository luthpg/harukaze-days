import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Link, useRouterState } from '@tanstack/react-router';
import { CalendarDays, Home, Palette, Settings } from 'lucide-react'; // アイコン例

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

export function Sidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <aside className="w-64 min-h-screen bg-muted/40 border-r p-4 flex flex-col">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2">
          {/* <img src="/logo.svg" alt="App Logo" className="h-8 w-8" /> */}
          <h1 className="text-2xl font-bold text-primary">Date Logger</h1>
        </Link>
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant={currentPath === item.to ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start text-md',
              currentPath === item.to
                ? 'font-semibold text-primary'
                : 'text-foreground/70',
            )}
            asChild
          >
            <Link to={item.to}>
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <Separator className="my-4" />
      <div className="mt-auto">
        {/* フッターに置きたい情報など (例: バージョン情報) */}
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}

// アイコンのみのミニマルなサイドバー
export function MinimalSidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  return (
    <aside className="w-16 min-h-screen bg-muted/40 border-r p-2 flex flex-col items-center">
      <div className="mb-8">
        <Link to="/" className="flex items-center justify-center">
          <CalendarDays className="h-8 w-8 text-primary" />{' '}
          {/* 仮のロゴアイコン */}
        </Link>
      </div>
      <nav className="flex flex-col gap-3 flex-1 items-center">
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.label} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant={currentPath === item.to ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn(
                    currentPath === item.to
                      ? 'text-primary'
                      : 'text-foreground/70',
                  )}
                  asChild
                >
                  <Link to={item.to}>
                    <item.icon className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  );
}
