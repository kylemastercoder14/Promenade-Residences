import { Navbar } from "@/components/layout/navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {/* <Navbar /> */}
      {children}
    </div>
  );
};

export default Layout;
