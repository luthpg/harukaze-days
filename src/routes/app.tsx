import { SidebarNavContent } from '@/components/sidebar-contents';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/lib/db';
import { isAuthenticatedAtom, userAtom } from '@/stores/auth';
import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
} from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/app')({
  // beforeLoad: ({ context, location }) => {
  //   // ... 既存の認証チェック
  // },
  component: AppPageLayout,
});

function AppPageLayout() {
  const navigate = useNavigate({ from: Route.fullPath });
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false); // Sheetの状態管理

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login', replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        読み込み中またはリダイレクト中...
      </div>
    );
  }

  const handleLinkClick = () => {
    setIsMobileSheetOpen(false); // リンククリックでSheetを閉じる
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar (md以上で表示) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
        <div className="border-r bg-muted/40 h-full">
          <SidebarNavContent />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 md:pl-64">
        {' '}
        {/* デスクトップサイドバーの幅を考慮 */}
        <AppHeader onMenuClick={() => setIsMobileSheetOpen(true)} />{' '}
        {/* isMobileSheetOpen を渡す */}
        <main className="p-4 md:p-6 lg:p-8 flex-1">
          {' '}
          {/* mainのpaddingを少し調整 */}
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar (Sheet) (md未満でトリガー表示) */}
      <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
        <SheetContent
          title="test"
          side="left"
          className="p-0 w-72 bg-background"
          aria-describedby={undefined}
        >
          {/* アクセシビリティのためのタイトル (視覚的には非表示) */}
          <SheetTitle className="sr-only">メインナビゲーション</SheetTitle>{' '}
          {/* パディングをリセットし、SheetContent内で管理 */}
          <SidebarNavContent onLinkClick={handleLinkClick} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface AppHeaderProps {
  onMenuClick: () => void; // モバイルメニュークリック時のコールバック
}

function AppHeader({ onMenuClick }: AppHeaderProps) {
  const navigate = useNavigate();
  const user = useAtomValue(userAtom);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/login', replace: true });
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-4 md:px-6">
      <div className="flex items-center gap-2">
        {/* Mobile Menu Trigger (md未満で表示) */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick} // Sheetのトリガーではなく、Stateを更新
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">ナビゲーションを開く</span>
        </Button>
        {/* Desktop App Name/Logo (md以上で表示) or Page Title */}
        <Link
          to="/app"
          className="hidden md:flex items-center gap-2 text-lg font-semibold"
        >
          {/* <CalendarDays className="h-6 w-6" /> */}
          <span>マイカレンダー</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {user?.email}
        </span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          ログアウト
        </Button>
      </div>
    </header>
  );
}
