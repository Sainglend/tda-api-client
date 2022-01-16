// const tdaapiclient = require("tda-api-client");
//
// async function addStuff(futures, equity) {
//     await tdastream.qchartHistoryFuturesGet("/ES", tdaapiclient.streaming.CHART_HISTORY_FUTURES_FREQUENCY.DAY_ONE, "w1");
//     await tdastream.qchartHistoryFuturesGet("/GC", tdaapiclient.streaming.CHART_HISTORY_FUTURES_FREQUENCY.DAY_ONE, "w1");
//     await tdastream.qchartHistoryFuturesGet("/NQ", tdaapiclient.streaming.CHART_HISTORY_FUTURES_FREQUENCY.DAY_ONE, "w1");
//     await tdastream.qgenericStreamRequest({
//         service: "LEVELONE_FUTURES",
//         command: "SUBS",
//         parameters: {
//             keys: futures,
//         },
//     });
//     await tdastream.qgenericStreamRequest({
//         service: "CHART_EQUITY",
//         command: "SUBS",
//         parameters: {
//             keys: equity,
//         },
//     });
// }
//
// const streamConfig = {
//     authConfig: {
//         "refresh_token": "",
//         "client_id": "",
//     },
// };
//
// const tdastream = new tdaapiclient.streaming.TDADataStream(streamConfig);
// tdastream.doDataStreamLogin().catch(console.log);
//
// // this simulates a batch of requests that occurs after 10 seconds, then 30 seconds
// setTimeout(() => addStuff("/ES", "TSLA") ,10000);
// setTimeout(() => addStuff("/NQ", "MSFT") ,30000);
