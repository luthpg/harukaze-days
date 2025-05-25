import { Button } from '@/components/ui/button';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Date Logger</h1>
        <p className="text-xl text-muted-foreground mb-8">
          大切な日付を簡単に記録し、カレンダーで一目で確認。
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
      <footer className="absolute bottom-8 text-muted-foreground text-sm">
        © {new Date().getFullYear()} Date Logger App
      </footer>
    </div>
  );
}
