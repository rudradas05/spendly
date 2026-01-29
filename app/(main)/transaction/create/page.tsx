import { getUserAccounts } from "@/actions/dashboard";
import { getTransaction } from "@/actions/transaction";
import { defaultCategories } from "@/data/categories";
import AddTransactionForm from "../_components/transaction-form";

interface AddTransactionPageProps {
  searchParams?: { edit?: string } | Promise<{ edit?: string }>;
}

const AddTransactionPage = async ({ searchParams }: AddTransactionPageProps) => {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const accounts = (await getUserAccounts()) ?? [];
  const editParam = resolvedSearchParams?.edit;
  const editId = Array.isArray(editParam) ? editParam[0] : editParam;
  const initialTransaction = editId ? await getTransaction(editId) : null;
  const isEditing = Boolean(editId);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-12 pt-5">
      <div className="mb-4 space-y-2">
        <p className="section-kicker">Transactions</p>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold md:text-4xl">
            {isEditing ? "Edit transaction" : "Add transaction"}
          </h1>
          <span className="surface-chip">
            {isEditing ? "Editing mode" : "New entry"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {isEditing
            ? "Update the details and keep your records accurate."
            : "Log income or expenses to keep your accounts up to date."}
        </p>
      </div>

      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        initialData={initialTransaction}
        forceEdit={isEditing}
      />
    </div>
  );
};

export default AddTransactionPage;
