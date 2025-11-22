const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen bg-zinc-100 w-full overflow-hidden flex items-center justify-center">
      <div className="max-w-7xl w-full p-10 mx-auto">{children}</div>
    </div>
  );
};

export default Layout;
