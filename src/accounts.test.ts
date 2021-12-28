import testAuthConfig from "./test_tdaclientauth.json";
import path from "path";
import {EGetAccountField, getAccount, getAccounts, IAccount, IGetAccountConfig, IGetAccountsConfig} from "./accounts";

const testauthpath = path.join(__dirname, "test_tdaclientauth.json");

describe("accounts", () => {
    test("getAccounts", async () => {
        expect(testAuthConfig).toBeTruthy();

        const config: IGetAccountsConfig = {
            fields: [EGetAccountField.ORDERS, EGetAccountField.POSITIONS],
            authConfigFileLocation: testauthpath,
        };
        const result: IAccount[] = await getAccounts(config);
        expect(result).toBeTruthy();
        expect(result[0].securitiesAccount.accountId).toBeTruthy();
        expect(result[0].securitiesAccount.currentBalances).toBeTruthy();
    });

    test("getAccount", async () => {
        const accounts: IAccount[] = await getAccounts({
            fields: "positions,orders",
            authConfigFileLocation: testauthpath,
        });

        expect(accounts[0].securitiesAccount.accountId).toBeTruthy();

        const config: IGetAccountConfig = {
            accountId: accounts[0].securitiesAccount.accountId,
            authConfigFileLocation: testauthpath,
        };
        const account: IAccount = await getAccount(config);
        expect(String(account.securitiesAccount.accountId)).toBe(String(accounts[0].securitiesAccount.accountId));
        expect(account.securitiesAccount.currentBalances).toBeTruthy();
    });
});
