export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center p-4"
      style={{
        backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(200,245,60,0.04) 0%, transparent 60%),
                          radial-gradient(ellipse at 80% 20%, rgba(200,245,60,0.03) 0%, transparent 50%)`
      }}>
      {children}
    </div>
  );
}
