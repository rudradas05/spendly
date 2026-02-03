import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="container mx-auto min-h-screen px-4 pb-16 pt-28">
      {children}
    </div>
  );
};

export default MainLayout;
