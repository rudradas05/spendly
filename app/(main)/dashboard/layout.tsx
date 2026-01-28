import { BarLoader } from "react-spinners";

import { Suspense } from "react";
import DashboardPage from "./page";

const DashboardLayout = () => {
  return (
    <div className="w-full">
      <Suspense
        fallback={<BarLoader className="mt-6" width="100%" color="#14b8a6" />}
      >
        <DashboardPage />
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
