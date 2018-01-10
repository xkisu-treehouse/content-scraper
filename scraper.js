const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
var json2csv = require('json2csv');

const baseURL = 'http://www.shirts4mike.com/shirts.php';

// create data folder if it doesn't exist
if (!fs.existsSync('data')){
    fs.mkdirSync('data');
}

var shirtUrls = [];
var shirtDetails = [];

// request the page
request(baseURL, function(error, response, html){
    // if there was no errors geting the html
    if(!error){
        // create a new instance of cherrio to get the data
        var $ = cheerio.load(html);

        // get the urls for the shirts
        $('.products li a').each(function(i ,el){
            var url = $(this).attr('href');
            shirtUrls.push(url);
        });

        // loop over each of the URLs for the shirts
        shirtUrls.forEach(function(url) {
            request('http://www.shirts4mike.com/' + url, function(error, response, html){

                // remove the url from the array
                var index = shirtUrls.indexOf(url);
                if (index > -1) {
                    shirtUrls.splice(index, 1);
                }

                // get the shirt details
                var $ = cheerio.load(html);

                var shirt = {
                    'title': '', 
                    'price': '', 
                    'image': '',
                    'url': ''
                };

                shirt.title = $('.shirt-details h1').text().split(',')[0].replace(/.{4}/, '');
                shirt.price = $('.price').html();
                shirt.image = $('.shirt-picture img').attr('src');
                shirt.url = url;

                shirtDetails.push(shirt);

                // check if we've gotten all the shirts
                if(shirtUrls.length == 0) {
                    var d = new Date();
                    var date = require('moment')().format('YYYY-MM-DD');

                    var csv = json2csv({ 
                        data: shirtDetails, 
                        fields: [
                            'title',
                            'price',
                            'image',
                            'url'
                        ],
                        quotes: ''
                    });
                    
                   fs.writeFile('./data/'+date+'.csv', csv, function(err) {
                     if (err) throw err;
                     console.log('file saved');
                   });
                }
            });
        });
    } else {
        //handle the errors 
        if(error.code == 'ENOTFOUND'){
            console.log('There’s been an error! Unable to connect to ' + baseURL);
        } else {
            cdonsole.log('Unknown error has occured');
        }

    }
})