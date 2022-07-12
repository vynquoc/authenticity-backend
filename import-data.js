const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Product = require('./models/productModel')
const Brand = require('./models/brandModel')
const Category = require('./models/categoryModel')

dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true
}).then(() => console.log('connected'))
//read

// const products = JSON.parse(fs.readFileSync('./data/collectibles.json', 'utf-8'))


const addField = () => {
    Product.createIndexes({productCode: 'text'})
    console.log('done')
}

// const importData = async () => {
//     try {
//         await products.forEach(async (product) => {

//             await Product.create({
//                 "brand": "614cb678642efb6914b4209a",
//                 "colorway": product.colorway,
//                 "condition": product.condition,
//                 "description": product.description,
//                 "images": product.images,
//                 "category": "61643d9deacf36e026e1bb05",
//                 "releaseDate": product.releaseDate,
//                 "retailPrice": product.retailPrice,

//                 "styleId": product.styleId,
//                 "name": product.name,
//                 "year": product.year,
//                 "tags": product.tags,
//                 // "sizes": ["XS", "S", "M", "L", "XL", "XXL"]
//             })
//             //shoessize: ["614a17f548b2b02fb625f123", "614a17fa48b2b02fb625f125", "614a17fc48b2b02fb625f127", "614a180348b2b02fb625f129", "614a180648b2b02fb625f12b", "614a180948b2b02fb625f12d", "614a180e48b2b02fb625f12f", "614a181048b2b02fb625f131", "614a181348b2b02fb625f133"]
//             //streetwear: ["614cb74e8a6e74e28c594a9f", "614cb7548a6e74e28c594aa1", "614cb7588a6e74e28c594aa3", "614cb75c8a6e74e28c594aa5"]
//         })
//         console.log('successfully loaded')

//     } catch (error) {
//         console.log(error)
//     }
// }

// const deleteData = async () => {
//     try {
//         await Product.deleteMany({ category: '61643d9deacf36e026e1bb05' })
//         console.log("Deleted!!!!")
//         process.exit()
//     } catch (error) {
//         console.log(error)
//     }
// }
addField()

// deleteData()
// importData()
//
