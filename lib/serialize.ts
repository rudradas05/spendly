type DecimalLike = { toNumber: () => number };

type SerializableAmounts = {
  balance?: DecimalLike | number | null;
  amount?: DecimalLike | number | null;
  minBalance?: DecimalLike | number | null;
};

export const toNumber = (value: DecimalLike | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "object" && "toNumber" in value) return value.toNumber();
  return Number(value);
};

export const serializeDecimal = <
  T extends Record<string, unknown> & SerializableAmounts
>(obj: T): T & { balance?: number | null; amount?: number | null; minBalance?: number | null } => {
  const serialized = { ...obj } as T & {
    balance?: number | null;
    amount?: number | null;
    minBalance?: number | null;
  };
  if (obj.balance !== undefined) serialized.balance = toNumber(obj.balance) || null;
  if (obj.amount !== undefined) serialized.amount = toNumber(obj.amount) || null;
  if (obj.minBalance !== undefined)
    serialized.minBalance = obj.minBalance !== null && obj.minBalance !== undefined ? toNumber(obj.minBalance) : null;
  return serialized;
};

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Something went wrong";
