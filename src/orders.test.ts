import * as path from "path";
import {
    cancelOrder,
    EOrderDuration,
    EOrderStatus,
    EOrderType,
    generateBuyLimitEquityOrder,
    getOrder, getOrdersByAccount,
    getOrdersByQuery,
    IOrderGet, IOrdersByAccountConfig,
    IOrdersByQueryConfig,
    IPlaceOrderConfig,
    IReplaceOrderConfig,
    placeOrder,
    replaceOrder,
} from "./orders";
import {getAccounts} from "./accounts";
import {IWriteResponse, TacRequestConfig} from "./tdapiinterface";

const testauthpath = path.join(__dirname, "test_tdaclientauth.json");

jest.setTimeout(20000);

describe("orders", () => {
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

    test("placeOrder, replaceOrder, getOrder, cancelOrder", async () => {
        expect(baseConfig.authConfigFileLocation).toBeTruthy();

        // place an order
        const config: IPlaceOrderConfig = {
            accountId: accountId,
            orderJSON: generateBuyLimitEquityOrder({ symbol: "F", price: 2.50, quantity: 1 }),
            ...baseConfig,
        };
        const result: IWriteResponse = await placeOrder(config);
        expect(result).toBeTruthy();
        expect(result.location).toBeTruthy();
        const orderId: string = result.location.substring(result.location.lastIndexOf("/") + 1);

        // verify the order exists
        const order: IOrderGet = await getOrder({
            accountId,
            orderId,
            ...baseConfig,
        });
        expect(String(order.orderId)).toBe(String(orderId));
        expect(order.quantity).toBe(1);
        expect(order.duration).toBe(EOrderDuration.DAY);
        expect(order.orderType).toBe(EOrderType.LIMIT);
        expect(order.status).not.toBe(EOrderStatus.CANCELED);
        expect(order.price).toBe(2.5);
        // @ts-ignore
        expect(order?.orderLegCollection[0].instrument.symbol).toBe("F");

        // next replace an order
        const configReplace: IReplaceOrderConfig = {
            orderId,
            accountId: accountId,
            orderJSON: generateBuyLimitEquityOrder({ symbol: "F", price: 3.50, quantity: 1 }),
            ...baseConfig,
        };
        const resultReplace: IWriteResponse = await replaceOrder(configReplace);
        expect(resultReplace).toBeTruthy();
        expect(resultReplace.location).toBeTruthy();
        const orderIdReplace: string = resultReplace.location.substring(resultReplace.location.lastIndexOf("/") + 1);

        // verify the order exists
        const orderReplaced: IOrderGet = await getOrder({
            accountId,
            orderId: orderIdReplace,
            ...baseConfig,
        });
        expect(String(orderReplaced.orderId)).toBe(String(orderIdReplace));
        expect(orderReplaced.quantity).toBe(1);
        expect(orderReplaced.duration).toBe(EOrderDuration.DAY);
        expect(orderReplaced.orderType).toBe(EOrderType.LIMIT);
        expect(orderReplaced.status).not.toBe(EOrderStatus.CANCELED);
        expect(orderReplaced.price).toBe(3.5);
        // @ts-ignore
        expect(order?.orderLegCollection[0].instrument.symbol).toBe("F");


        // cancel the order
        await cancelOrder({
            accountId,
            orderId: orderIdReplace,
            ...baseConfig,
        });

        // verify the cancel
        const orderC: IOrderGet = await getOrder({
            accountId,
            orderId: orderIdReplace,
            ...baseConfig,
        });
        expect(String(orderC.orderId)).toBe(String(orderIdReplace));
        expect(orderC.status).toBe(EOrderStatus.CANCELED);
    });

    test("getOrdersByQuery", async () => {
        const config: IOrdersByQueryConfig = {
            maxResults: 5,
            fromEnteredTime: new Date(Date.now() - 14*24*60*60*1000).toISOString().substring(0, 10),
            toEnteredTime: new Date().toISOString().substring(0, 10),
            status: EOrderStatus.CANCELED,
            ...baseConfig,
        };
        const result = await getOrdersByQuery(config);
        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
    });

    test("getOrdersByAccount", async () => {
        const config: IOrdersByAccountConfig = {
            accountId,
            maxResults: 5,
            fromEnteredTime: new Date(Date.now() - 14*24*60*60*1000).toISOString().substring(0, 10),
            toEnteredTime: new Date().toISOString().substring(0, 10),
            status: EOrderStatus.CANCELED,
            ...baseConfig,
        };
        const result = await getOrdersByAccount(config);
        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
    });

});
