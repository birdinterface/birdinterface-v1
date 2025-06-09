export default async function IntelligenceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[calc(100vh-2.5rem)] md:h-[calc(100vh-3.5rem)]">
      {children}
    </div>
  )
}
