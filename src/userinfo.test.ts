import path from "path";
import {TacRequestConfig} from "./tdapiinterface";
import {
    EPrefAuthTokenTimeout,
    EUserPrincipalFields,
    getStreamerSubKeys,
    getUserPreferences, getUserPrincipals,
    IGetStreamerKeysConfig,
    IGetUserPreferencesConfig,
    IGetUserPrincipalsConfig,
    IPreferences, IPreferencesUpdate,
    IStreamerSubKeys, IUpdateUserPrefConfig, IUserPrincipal, updateUserPreferences
} from "./userinfo";
import {getAccounts} from "./accounts";

const testauthpath = path.join(__dirname, "test_tdaclientauth.json");

describe("userinfo", () => {
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

    test("getUserPreferences", async () => {
        const config: IGetUserPreferencesConfig = {
            ...baseConfig,
            accountId,
        };

        const result: IPreferences = await getUserPreferences(config);
        expect(result).toBeTruthy();
        expect(Object.values(EPrefAuthTokenTimeout)).toContain(result.authTokenTimeout);
    });

    test("getStreamerSubKeys", async () => {
        const config: IGetStreamerKeysConfig = {
            ...baseConfig,
            accountIds: accountId,
        };

        const result: IStreamerSubKeys = await getStreamerSubKeys(config);
        expect(result).toBeTruthy();
        expect(result.keys[0].key).toBeTruthy();
    });

    test("getUserPrincipals", async () => {
        const config: IGetUserPrincipalsConfig = {
            ...baseConfig,
            fields: [
                EUserPrincipalFields.STREAMER_CONNECTION_INFO,
                EUserPrincipalFields.PREFERENCES,
                EUserPrincipalFields.STREAMER_SUB_KEYS,
                EUserPrincipalFields.SURROGATE_IDS
            ],
        };

        const result: IUserPrincipal = await getUserPrincipals(config);
        expect(result).toBeTruthy();
        expect(result.accounts.map(acct => acct.accountId)).toContain(accountId);
    });

    test("updateUserPreferences", async () => {
        const config: IGetUserPreferencesConfig = {
            ...baseConfig,
            accountId,
        };

        const result: IPreferences = await getUserPreferences(config);
        expect(result).toBeTruthy();
        expect(Object.values(EPrefAuthTokenTimeout)).toContain(result.authTokenTimeout);

        const preferences: IPreferencesUpdate = {
            ...result,
        };
        // delete the two fields from the get result that can't be updated via this method
        // @ts-ignore
        delete preferences.directEquityRouting;
        // @ts-ignore
        delete preferences.directOptionsRouting;

        const updateConfig: IUpdateUserPrefConfig = {
            ...baseConfig,
            accountId,
            preferences,
        };

        await updateUserPreferences(updateConfig);
        // at this point we are just expecting a 2XX response
        expect(1).toBe(1);
    });
});
