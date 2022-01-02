import path from "path";
import {getAccounts} from "./accounts";
import {IWriteResponse, TacRequestConfig} from "./tdapiinterface";
import {
    createWatchlist,
    createBasicWatchlistItem,
    deleteWatchlist,
    getWatchlist,
    getWatchlistsMultiAcct,
    getWatchlistsSingleAcct,
    ICreateWatchlistConfig,
    IGetWatchlistConfig,
    IGetWatchlistsSingleAcctConfig,
    IWatchlist,
    IWatchlistReplaceConfig,
    IWatchlistUpdateConfig,
    replaceWatchlist, updateWatchlist, IDeleteWatchlistConfig
} from "./watchlists";

const testauthpath = path.join(__dirname, "test_tdaclientauth.json");

describe("watchlists", () => {
    const uniqueTestNameBase = "testwlapi";
    let accountId = "";

    const baseConfig: TacRequestConfig = {
        verbose: false,
        authConfigFileLocation: testauthpath,
    };

    beforeAll(async () => {
        // first find an account for placing the order
        const accounts = await getAccounts({
            ...baseConfig,
        });
        accountId = accounts[0].securitiesAccount.accountId;
    });

    afterAll(async () => {
        // delete all watchlists with a name like uniqueTestNameBase
        // get all for the target account
        const getConfig: IGetWatchlistsSingleAcctConfig = {
            accountId,
            ...baseConfig,
        };

        const getResult: IWatchlist[] = await getWatchlistsSingleAcct(getConfig);
        expect(Array.isArray(getResult)).toBe(true);

        for (let i = 0; i < getResult.length; i++) {
            if (getResult[i].name.startsWith(uniqueTestNameBase)) {
                await deleteWatchlist({
                    ...baseConfig,
                    accountId,
                    watchlistId: getResult[i].watchlistId,
                });
            }
        }
    });

    test("createWatchlist then getWatchlist", async () => {
        const wlName = uniqueTestNameBase + Math.random().toString().substring(3, 8);
        const config: ICreateWatchlistConfig = {
            watchlistJSON: {
                name: wlName,
                watchlistItems: [
                    createBasicWatchlistItem("SPY"),
                ],
            },
            accountId,
            ...baseConfig,
        };

        const result: IWriteResponse = await createWatchlist(config);
        expect(result).toBeTruthy();
        expect(result.location).toBeTruthy();
        const watchlistId: string = result.location.substring(result.location.lastIndexOf("/") + 1);

        const getConfig: IGetWatchlistConfig = {
            accountId,
            watchlistId,
            ...baseConfig,
        };

        const getResult: IWatchlist = await getWatchlist(getConfig);
        expect(getResult).toBeTruthy();
        expect(getResult.name).toBe(wlName);
        expect(getResult.watchlistItems.length).toBe(1);
    });

    test("getWatchlistsSingleAcct", async () => {
        const getConfig: IGetWatchlistsSingleAcctConfig = {
            accountId,
            ...baseConfig,
        };

        const getResult: IWatchlist[] = await getWatchlistsSingleAcct(getConfig);
        expect(getResult).toBeTruthy();
        expect(Array.isArray(getResult)).toBe(true);
    });

    test("getWatchlistsSingleAcct", async () => {
        const getConfig: TacRequestConfig = {
            ...baseConfig,
        };

        const getResult: IWatchlist[] = await getWatchlistsMultiAcct(getConfig);
        expect(getResult).toBeTruthy();
        expect(Array.isArray(getResult)).toBe(true);
    });

    test("replaceWatchlist", async () => {
        const wlName = uniqueTestNameBase + Math.random().toString().substring(3, 8);
        const config: ICreateWatchlistConfig = {
            watchlistJSON: {
                name: wlName,
                watchlistItems: [
                    createBasicWatchlistItem("SPY"),
                ],
            },
            accountId,
            ...baseConfig,
        };

        const createResult: IWriteResponse = await createWatchlist(config);
        expect(createResult).toBeTruthy();
        expect(createResult.location).toBeTruthy();
        const watchlistId: string = createResult.location.substring(createResult.location.lastIndexOf("/") + 1);

        const replaceConfig: IWatchlistReplaceConfig = {
            accountId,
            watchlistId,
            watchlistJSON: {
                name: wlName + "1",
                watchlistItems: [
                    createBasicWatchlistItem("MSFT"),
                    createBasicWatchlistItem("QQQ"),
                ],
            },
            ...baseConfig,
        };

        const result: IWriteResponse = await replaceWatchlist(replaceConfig);
        expect(result).toBeTruthy();
        expect(result.location).toBeTruthy();
        const replacedWatchlistId: string = result.location.substring(result.location.lastIndexOf("/") + 1);
        expect(replacedWatchlistId).toBe(watchlistId);

        // get it to verify the change via name
        const getConfig: IGetWatchlistConfig = {
            accountId,
            watchlistId,
            ...baseConfig,
        };

        const getResult: IWatchlist = await getWatchlist(getConfig);
        expect(getResult).toBeTruthy();
        expect(getResult.name).toBe(wlName + "1");
        expect(getResult.watchlistItems.length).toBe(2);
    });

    test("updateWatchlist", async () => {
        const wlName = uniqueTestNameBase + Math.random().toString().substring(3, 8);
        const config: ICreateWatchlistConfig = {
            watchlistJSON: {
                name: wlName,
                watchlistItems: [
                    createBasicWatchlistItem("SPY"),
                ],
            },
            accountId,
            ...baseConfig,
        };

        const createResult: IWriteResponse = await createWatchlist(config);
        expect(createResult).toBeTruthy();
        expect(createResult.location).toBeTruthy();
        const watchlistId: string = createResult.location.substring(createResult.location.lastIndexOf("/") + 1);

        // get it to use for the update
        const getConfig: IGetWatchlistConfig = {
            accountId,
            watchlistId,
            ...baseConfig,
        };
        const getResult: IWatchlist = await getWatchlist(getConfig);
        expect(getResult).toBeTruthy();
        expect(getResult.name).toBe(wlName);
        expect(getResult.watchlistItems.length).toBe(1);

        const updateConfig: IWatchlistUpdateConfig = {
            accountId,
            watchlistId,
            watchlistJSON: {
                watchlistItems: getResult.watchlistItems,
                name: wlName + "2",
            },
            ...baseConfig,
        };

        const result: IWriteResponse = await updateWatchlist(updateConfig);
        expect(result).toBeTruthy();
        expect(result.location).toBeTruthy();
        const replacedWatchlistId: string = result.location.substring(result.location.lastIndexOf("/") + 1);
        expect(replacedWatchlistId).toBe(watchlistId);

        // get it to verify the change via name and no symbol change
        const getConfig2: IGetWatchlistConfig = {
            accountId,
            watchlistId,
            ...baseConfig,
        };

        const getResult2: IWatchlist = await getWatchlist(getConfig2);
        expect(getResult2).toBeTruthy();
        expect(getResult2.name).toBe(wlName + "2");
        expect(getResult2.watchlistItems.length).toBe(1);
    });

    test("deleteWatchlist", async () => {
        const wlName = uniqueTestNameBase + Math.random().toString().substring(3, 8);
        const config: ICreateWatchlistConfig = {
            watchlistJSON: {
                name: wlName,
                watchlistItems: [
                    createBasicWatchlistItem("SPY"),
                ],
            },
            accountId,
            ...baseConfig,
        };

        const createResult: IWriteResponse = await createWatchlist(config);
        expect(createResult).toBeTruthy();
        expect(createResult.location).toBeTruthy();
        const watchlistId: string = createResult.location.substring(createResult.location.lastIndexOf("/") + 1);

        const deleteConfig: IDeleteWatchlistConfig = {
            accountId,
            watchlistId,
            ...baseConfig,
        };
        await deleteWatchlist(deleteConfig);

        // attempt to get it
        const getConfig: IGetWatchlistConfig = {
            accountId,
            watchlistId,
            ...baseConfig,
        };
        let getError;
        try {
            await getWatchlist(getConfig);
        } catch(e) {
            getError = String(e);
        }

        expect(getError).toContain("404");
        expect(getError).toContain("Watchlist not found");
    });
});
