const dbOperations = require('./dboperations');
const express = require('express');
const path = require('path');
const { Console } = require('console');
const app = express();
const fs = require('fs')





app.set('views', path.join(__dirname, 'views'))
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')



app.get('/', async (req, res) => {
    
    let filenames = fs.readdirSync('public/imgs')
    const regex = /\//g;
    products = await dbOperations.getAll()
    let prices = await dbOperations.getProductPrice()
    for await (product of products) {
        product['image'] = []
        filenames.forEach(file => {
            let index = file.indexOf('&')
            if (product.REFER.trim() == file.slice(0, index)) {
                product['image'].push(encodeURIComponent(file))
            }
        })
        prices.forEach(productPrice => {
            if (productPrice.REFER == product.REFER) {
                product['pPrice'] = productPrice.P
                product['mPrice'] = productPrice.M
                product['gPrice'] = productPrice.G
                product["ggPrice"] = productPrice.GG
            }
        })

    }
    res.render('home', { products, regex, prices, filenames })    
})

app.get('/?r=:refer', async(req, res) => {
    let prices = await dbOperations.getProductPrice()
    let filenames = fs.readdirSync('public/imgs')
    const { refer } = req.params;
    const regex = /\//g;
    const products = await dbOperations.getRefer(refer)
    const orders = await dbOperations.getOrders(refer)

    // Fixing Products data Based in other Tables
    for await (product of products){
        filenames.forEach(file => {
            if (`${product.REFER}&${product.DESCR.trim()}.jpg` == file) {
                product["image"] = encodeURIComponent(file)
            } else if (`${product.REFER}&${product.DESCR.trim()}.jpeg` == file) {
                product["image"] = encodeURIComponent(file)
            }
        })


        // Getting the price for each Product
        prices.forEach(productPrice => {
            if (productPrice.REFER == product.REFER) {
                product['pPrice'] = productPrice.P
                product['mPrice'] = productPrice.M
                product['gPrice'] = productPrice.G
                product["ggPrice"] = productPrice.GG
            }
        })

        // Taking out the ordered products from total
        orders.forEach(order => {
            if (order.REFER == product.REFER && order.DESCR.trim() == product.DESCR.trim()){
                if (order.P){
                    product.P = (Number(product.P) - Number(order.P))
                }
                if (order.M){
                    product.M = (Number(product.M) - Number(order.M))
                }
                if (order.G){
                    product.G = (Number(product.G) - Number(order.G))
                }
                if (order.GG){
                    product.GG = (Number(product.GG) - Number(order.GG))
                }                
            }
        })

    }
    
    res.render('refer', { refer, products, regex })    
})



app.listen(3000, () => {
    console.log("Server On Port 8080.")
})