import { UserAccount } from "./UserAccount.interface";

export interface Activity {
  name: any;
  description: string;
  amount: string;
  date: string;
  type: string;
  status: string;
  userAccount?: UserAccount;
}
