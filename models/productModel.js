const mongoose = require('mongoose')
const Schema = mongoose.Schema
const slugify = require('slugify')

const productSchema = new Schema({
    brand: {
        type: Schema.Types.ObjectId,
        ref: 'Brand'
    },
    name: {
        type: String,
        unique: true
    },
    productCode: {
        type: String,
    },
    slug: String,
    styleId: {
        type: String
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    colorway: {
        type: String,
    },
    sizes: [String],
    condition: {
        type: String,
        default: 'New'
    },
    description: {
        type: String,
    },
    images: {
        type: Object
    },
    releaseDate: {
        type: Date,
    },
    retailPrice: {
        type: Number
    },
    year: {
        type: Number,
    },
    tags: {
        type: [String]
    },
    hidden: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

productSchema.index({name: 'text', tags: 'text', productCode: 'text'})


//create slug
productSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

//populate brand and category
productSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'brand',
        select: 'name -_id'
    }).populate({
        path: 'category',
        select: 'name -_id'
    })
    next()
})

// productSchema.virtual('brands', {
//     ref: 'Brand',
//     foreignField: '_id',
//     localField: 'brand',
// })
// productSchema.virtual('asks', {
//     ref: 'Ask',
//     localField: '_id',
//     foreignField: 'product',
// })
const Product = mongoose.model('Product', productSchema)


module.exports = Product