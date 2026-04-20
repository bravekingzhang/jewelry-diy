export default function BuilderLoading() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[470px] flex-col overflow-hidden bg-[#EFEFF2]">
      <header className="shrink-0 border-b border-[#E1E5EC] bg-[#EFEFF2]/95 px-4 pb-2 pt-1.5">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-8 w-8 animate-pulse rounded-full bg-[#E3E5EA]" />
          <div className="h-7 w-24 animate-pulse rounded-lg bg-[#E3E5EA]" />
          <div className="w-8" />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-3">
        <div className="h-[320px] w-[320px] animate-pulse rounded-[24px] bg-[#E3E5EA]" />
        <div className="h-4 w-48 animate-pulse rounded bg-[#E3E5EA]" />
        <div className="h-[200px] w-full animate-pulse rounded-[20px] bg-[#E3E5EA]" />
      </main>
    </div>
  );
}
