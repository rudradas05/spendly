// "use client";

// import { updateDefaultAccount } from "@/actions/account";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Switch } from "@/components/ui/switch";
// import useFetch from "@/hooks/use-fetch";
// import { ArrowDownRight, ArrowUpRight } from "lucide-react";
// import Link from "next/link";
// import { useEffect } from "react";
// import { toast } from "sonner";

// interface AccountCardProps {
//   account: {
//     id: string;
//     name: string;
//     type: "CURRENT" | "SAVINGS";
//     balance: string;
//     isDefault: boolean;
//   };
// }

// const AccountCard = ({ account }: AccountCardProps) => {
//   const { name, type, balance, id, isDefault } = account;

//   const {
//     loading: updateDefaultLoading,
//     fn: updateDefaultFn,
//     data: updateAccount,
//     error,
//   } = useFetch(updateDefaultAccount);

//   const handleDefaultChange = async (event: any) => {
//     event.preventDefault();
//     if (isDefault) {
//       toast.warning("You need atleast 1 default account");
//       return;
//     }
//     await updateDefaultFn(id);
//   };

//   useEffect(() => {
//     if (updateAccount?.success) {
//       toast.success("Default account updated successfully");
//     }
//   }, [updateAccount, updateDefaultLoading]);

//   useEffect(() => {
//     if (error) {
//       toast.error(error.message || "failed to update default account.");
//     }
//   }, [updateAccount, updateDefaultLoading]);

//   return (
//     <div>
//       <Card className="hover:shadow-md transition-shadow group relative">
//         <Link href={`/account/${id}`}>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium capitalize">
//               {name}
//             </CardTitle>
//             <Switch
//               className="cursor-pointer"
//               checked={isDefault}
//               onClick={handleDefaultChange}
//               disabled={updateDefaultLoading}
//             />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               ₹{parseFloat(balance).toFixed(2)}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {type.charAt(0) + type.slice(1).toLowerCase()} Account
//             </p>
//           </CardContent>
//           <CardFooter className="flex justify-between text-sm text-muted-foreground">
//             <div className="flex items-center">
//               <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
//               Income
//             </div>
//             <div className="flex items-center">
//               <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
//               Expense
//             </div>
//           </CardFooter>
//         </Link>
//       </Card>
//     </div>
//   );
// };

// export default AccountCard;

"use client";

import { updateDefaultAccount } from "@/actions/account";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/use-fetch";
import { ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface AccountCardProps {
  account: {
    id: string;
    name: string;
    type: "CURRENT" | "SAVINGS";
    balance: string;
    isDefault: boolean;
  };
}

const AccountCard = ({ account }: AccountCardProps) => {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updateAccount,
    error,
  } = useFetch(updateDefaultAccount);

  // ✅ Fix 1: Prevent redirect when switching
  const handleDefaultChange = async (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }
    await updateDefaultFn(id);
  };

  // ✅ Fix 2: Toast only once even if re-rendered
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (updateAccount?.success && !hasShownToast.current) {
      toast.success("Default account updated successfully");
      hasShownToast.current = true;
    }
  }, [updateAccount]);

  // ✅ Fix 3: Only trigger error toast once
  useEffect(() => {
    if (error && !hasShownToast.current) {
      toast.error(error.message || "Failed to update default account.");
      hasShownToast.current = true;
    }
  }, [error]);

  return (
    <div>
      <Card className="hover:shadow-md transition-shadow group relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Link href={`/account/${id}`} className="flex-1">
            <CardTitle className="text-sm font-medium capitalize">
              {name}
            </CardTitle>
          </Link>

          {updateDefaultLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              className="cursor-pointer"
              checked={isDefault}
              onClick={handleDefaultChange}
              disabled={updateDefaultLoading}
            />
          )}
        </CardHeader>

        <Link href={`/account/${id}`}>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{parseFloat(balance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {type.charAt(0) + type.slice(1).toLowerCase()} Account
            </p>
          </CardContent>

          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              Income
            </div>
            <div className="flex items-center">
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
              Expense
            </div>
          </CardFooter>
        </Link>
      </Card>
    </div>
  );
};

export default AccountCard;
