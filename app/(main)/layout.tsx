import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}
const MainLayout = ({ children }: MainLayoutProps) => {
  return <div className="container mx-auto px-4 pt-28 pb-16">{children}</div>;
};

export default MainLayout;
