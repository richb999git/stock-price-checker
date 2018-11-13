/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    // need to clear database before running tests---------
    // need to find yesterday's price for GOOG, GE and MSFT and change before test.....
  
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
        console.log('[Test1] 1 stock');
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          
          //complete this one too
          
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.equal(res.body.stockData.price, '1036.05');
          
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        console.log('[Test2] 1 stock with like');
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: "true"})
        .end(function(err, res){
          
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.equal(res.body.stockData.price, '1036.05');
          assert.equal(res.body.stockData.likes, 1);
          // really wanted to do something like this but can't work it out yet   -- could I find goog in the database and find the likes? 
          //assert.increases(res.body.stockData.likes).by(1);
        done();
        });
      });
      
      // this might run before last test is finished so saves an ip address. Therefore I've delayed it 0.01 seconds
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        setTimeout(function() {
          console.log('[Test3] 1 stock with like again (ensure likes arent double counted');
          chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'goog', like: "true"})
          .end(function(err, res){

            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.stock, "GOOG");
            assert.equal(res.body.stockData.price, '1036.05');
            assert.equal(res.body.stockData.likes, 1);  
            // really wanted to do something like this but can't work it out yet
            //assert.increases(res.body.stockData.likes).by(0);
          done();
          });
        },1);
      });
      
 
      test('2 stocks', function(done) {
        //setTimeout(function() {
          console.log('[Test4] 2 stocks');
          chai.request(server)
          .get('/api/stock-prices?stock=ge&stock=msft')
          .end(function(err, res){
            
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, "GE");
            assert.equal(res.body.stockData[0].price, '8.61');
            assert.equal(res.body.stockData[0].rel_likes, 0);  
            
            assert.equal(res.body.stockData[1].stock, "MSFT");
            assert.equal(res.body.stockData[1].price, '106.94');
            assert.equal(res.body.stockData[1].rel_likes, 0);
          done();
          });
        //},1);
      });
      
      test('2 stocks with like', function(done) {
        setTimeout(function() {
          console.log('[Test5] 2 stocks with like');
          chai.request(server)
          .get('/api/stock-prices?stock=ge&stock=msft&like=true')
          .end(function(err, res){

            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, "GE");
            assert.equal(res.body.stockData[0].price, '8.61');
            assert.equal(res.body.stockData[0].rel_likes, 0);  
            
            assert.equal(res.body.stockData[1].stock, "MSFT");
            assert.equal(res.body.stockData[1].price, '106.94');
            assert.equal(res.body.stockData[1].rel_likes, 0);
          done();
          });
        },2);
      });
      
    });

});
