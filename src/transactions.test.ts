import path from "path";
import {TacRequestConfig} from "./tdapiinterface";
import {
    ETransactionType,
    getTransaction,
    getTransactions,
    IGetTransactionConfig,
    IGetTransactionsConfig,
    ITransaction,
} from "./transactions";
import {getAccounts} from "./accounts";

describe("transactions", () => {
    let accountId = "";

    const baseConfig: TacRequestConfig = {
        verbose: false,
        authConfigFileLocation: path.join(__dirname, "test_tdaclientauth.json"),
    };

    beforeAll(async () => {
        // first find an account for placing the order
        const accounts = await getAccounts({
            ...baseConfig,
        });
        accountId = accounts[0].securitiesAccount.accountId;
    });

    test.only("getTransactions and getTransaction", async () => {
        expect(baseConfig.authConfigFileLocation).toBeTruthy();

        const config: IGetTransactionsConfig = {
            ...baseConfig,
            accountId,
            type: ETransactionType.ALL,
            startDate: new Date(Date.now() - 300*24*60*60*1000).toISOString().substring(0, 10),
            endDate: new Date().toISOString().substring(0, 10),
        };
        const result: ITransaction[] = await getTransactions(config);
        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBe(true);
        if (result.length > 0) {
            expect(result[0].transactionDate).toBeTruthy();
            expect(result[0].transactionId).toBeTruthy();

            const config: IGetTransactionConfig = {
                ...baseConfig,
                accountId,
                transactionId: result[0].transactionId,
            };
            const resultSingle: ITransaction = await getTransaction(config);
            expect(resultSingle).toBeTruthy();
            expect(resultSingle.transactionDate).toBe(result[0].transactionDate);
            expect(resultSingle.transactionId).toBe(result[0].transactionId);
        }
    });
});
