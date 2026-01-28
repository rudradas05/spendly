import { redirect } from "next/navigation";
import { getUserAccounts } from "@/actions/dashboard";

const AccountsRedirectPage = async () => {
  const accounts = (await getUserAccounts()) ?? [];
  const defaultAccount =
    accounts.find((account) => account.isDefault) ?? accounts[0];

  if (defaultAccount) {
    redirect(`/account/${defaultAccount.id}`);
  }

  redirect("/dashboard");
};

export default AccountsRedirectPage;
