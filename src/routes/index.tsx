import { Button } from '@/components/ui/button';
import { Link, createFileRoute } from '@tanstack/react-router';
import type React from 'react';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const gridBackgroundStyle: React.CSSProperties = {
    backgroundImage: `
      linear-gradient(0deg, transparent calc(100% - 1px), var(--background-border) calc(100% - 1px)),
      linear-gradient(90deg, transparent calc(100% - 1px), var(--background-border) calc(100% - 1px))
    `,
    backgroundSize: '100px 100px',
    backgroundRepeat: 'repeat',
    backgroundPosition: 'center center',
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-foreground p-8"
      style={gridBackgroundStyle}
    >
      <div className="bg-background/80 backdrop-blur-sm p-8 md:p-12 rounded-xl shadow-2xl text-center max-w-2xl z-10">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">はるかぜ</h1>
          <p className="text-xl text-muted-foreground mb-8">
            大切な日付を簡単に記録し、カレンダーで一目で確認
          </p>
          {/* ここにイメージ画像など <img src="/path/to/image.svg" alt="App hero" className="w-64 h-64 mx-auto mb-8" /> */}
        </header>
        <main className="text-center">
          <Link to="/login">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              ログインして始める
            </Button>
          </Link>
        </main>
      </div>
      <footer className="absolute bottom-8 text-muted-foreground text-sm">
        © {new Date().getFullYear()} はるかぜ
      </footer>
    </div>
  );
}
