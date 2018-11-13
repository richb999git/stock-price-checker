/*
*
*
*       FILL IN EACH UNIT TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]----
*       (if additional are added, keep them at the very end!)
*/

var chai = require('chai');
var StockHandler = require('../controllers/stockHandler.js');

var ticker = "MSFT";
var likes = 0;
var ipAddresses = [];

var stockPrices = new StockHandler(ticker, likes, ipAddresses);

suite('Unit Tests', function(){

//none required

});