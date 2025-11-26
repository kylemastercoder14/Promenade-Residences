/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useSuspenseAccount } from "@/features/accounts/hooks/use-accounts";
import { AccountForm } from './form';
import { User } from '@/lib/auth';

export const Account = ({ accountId }: { accountId: string }) => {
  const isCreate = accountId === "create";

  // If creating → do NOT fetch
  const account = isCreate ? null : useSuspenseAccount(accountId).data;

  return (
    <div>
      {isCreate ? (
        <AccountForm initialData={null} />
      ) : (
        <AccountForm initialData={account as User} />
      )}
    </div>
  );
};
