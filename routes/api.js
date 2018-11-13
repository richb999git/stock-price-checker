/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var axios = require("axios");
var expect = require('chai').expect;
var MongoClient = require('mongodb');
var mongoose = require("mongoose");

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });
var Schema = mongoose.Schema;
var StockSchema = new Schema({
    symbol:  {type: String, required: true},
    likes: Number,
    ips: [String]
  });

var Stock = mongoose.model("Stock", StockSchema);

module.exports = function (app) {//1

  app.route('/api/stock-prices')
    .get(function (req, res) {//2
      // https://api.iextrading.com/1.0/stock/goog/quote - closing price (property "close" of .data)
      // /stock/aapl/delayed-quote - 15 minute quote (property "delayedPrice" of .data)
      // req.ip is not correct all the time because of proxies so....
      var clientAddress = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress; // strips off excess by taking [0]
      var price, stock, likes;
      req.query.like === "true" ? likes = true: likes = false; // like is for one (in first form) or both (in second form)
    
      if (typeof(req.query.stock) === "object") { // 2nd form with 2 stocks (1 stock returns a string, 2 stocks returns an object)  //3
        
        var stock1 = req.query.stock[0].toUpperCase();
        var stock2 = req.query.stock[1].toUpperCase();
        if (stock1 === stock2) {
          return res.json({error: "Stock are the same. Please try again"});
        }

        axios.get('https://api.iextrading.com/1.0/stock/market/batch?symbols=' + stock1 + ',' + stock2 + '&types=quote')
          .then(function (response) { 
            var price1 = "" + response.data[stock1].quote.close;
            var price2 = "" + response.data[stock2].quote.close;
            // likes currently holds a boolean. it will hold quantity of likes
            newStock(stock1, likes, clientAddress).then(function(likes1) {
              newStock(stock2, likes, clientAddress).then(function(likes2) {
                res.json({"stockData":[{"stock": stock1, "price": price1, "rel_likes": likes1 - likes2},{"stock": stock2, "price": price2, "rel_likes": likes2 - likes1}]});
              });
            }, function(error) {
              console.error("Failed!", error);
              res.json({error: "cannot find data"});
            });
                      
          })  
          .catch(function (error) { 
            console.log("multi-price error: ", error);
            res.json({error: "Error getting prices. Possibly unknown stock included"});
          }); 

        } else {  //6  //3F
          
        axios.get('https://api.iextrading.com/1.0/stock/' + req.query.stock + '/quote')
          .then(function (response) {  //7
            price = ""+ response.data.close;
            stock = response.data.symbol;
            // likes currently holds a boolean. it will hold quantity of likes
            newStock(stock, likes, clientAddress).then(function(likes) {
              res.json({"stockData":{"stock": stock, "price":price, "likes": likes}});
            }, function(error) {
              console.error("Failed!", error);
              res.json({error: "cannot find data"});
            });                
                          
          })        
          .catch(function (error) { 
            var errorMessage = error.response.data;
            if (error.response.data !== "Unknown symbol") { errorMessage = "Unknown error getting price";};
            res.json({error: errorMessage});
          });  
                  
        } //6F    
    });  // closes app.route GET  //2F    
}; // closes main app function  //1F


function newStock(stock, likes, clientAddress) {
  return new Promise(function(resolve, reject) {
    Stock.findOne({symbol: stock}, function(err, data) {  //8
          var qtyLikes;
          if(err) {  //9
               console.log("database error", err); 
               reject(Error("database error"));
            } else {  //10  //9F

                // if stock not found in database save stock data
                  if (!data) {  //11        
                    // only save ips if liked
                    if (!likes) {
                      var stockData = new Stock({symbol: stock, likes: 0});
                      qtyLikes = 0;
                    } else {
                      var stockData = new Stock({symbol: stock, likes: 1, ips: [clientAddress]});
                      qtyLikes = 1;
                    }

                    stockData.save(function(err, data) {  //12
                      if (err) { 
                        console.log(err);
                      } 
                      console.log("saved!")
                      resolve(qtyLikes);
                    }); //12F

                  } else {  //14    //11F

                      // if stock found in database update stock data (like) IF not already liked by the ip
                      qtyLikes = data.likes;
                      if (likes) {
                        var ip = data.ips.find(function(el) {  //15
                          return el === clientAddress;
                        }); //15F
 
                        if (ip === undefined) {
                          // add the ip address to the data item and increase the likes by 1
                          ++qtyLikes;
                          data.likes = qtyLikes;
                          data.ips.push(clientAddress);
                          data.save(function(err, data) { 
                            if (err) {
                              console.log(err); 
                              reject(Error("database save error"));
                            } else {
                              console.log("stock updated:");
                              resolve(qtyLikes);
                            }
                          });
                        } else {resolve(qtyLikes);} // no new ip address resolve
                      } else {resolve(qtyLikes);} // no like resolve"
                  } // 14F
            }  // 10F
      }); // 8F
  });
}