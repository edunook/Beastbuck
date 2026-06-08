
export default function DesktopHub() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0d1117] text-white">
      <div className="max-w-2xl rounded-lg border border-border bg-surface p-12 text-center shadow-2xl">
        <h2 className="text-4xl font-bold">BeastBuck Desktop OS</h2>
        <p className="mt-6 text-lg text-text-muted">This is a simulated view of the native macOS and Windows desktop application.</p>
        <p className="mt-2 text-sm text-text-muted">Local file sync and productivity mode are active.</p>
      </div>
    </div>
  );
}
