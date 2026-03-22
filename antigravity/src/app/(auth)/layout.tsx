export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(210,100%,97%)] via-[hsl(210,50%,95%)] to-[hsl(190,80%,95%)] dark:from-[hsl(222,84%,5%)] dark:via-[hsl(220,60%,8%)] dark:to-[hsl(210,80%,10%)]">
      {children}
    </div>
  );
}
