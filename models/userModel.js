const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const { default: validator } = require('validator')



const userSchema = new Schema({
    username: {
        type: String,
        unique: [true, 'Tài khoản đã tồn tại'],
        minlength: [8, 'Tài khoản phải có ít nhất 8 kí tự'],
        required: [true, 'Tài khoản không được để trống']
    },
    name: {
        type: String,
        required: [true, 'Họ và tên không được để trống']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email không được để trống',
        validate: [validator.isEmail, 'Email không hợp lệ']
    },
    shoeSize: {
        type: String,
    },
    role: {
        type: String,
        enum: ['người dùng', 'nhân viên kiểm tra', 'nhân viên xử lý', 'nhân viên hỗ trợ', 'admin'],
        default: 'người dùng'
    },
    staffCode: {
        type: String
    },
    level: {
        type: Number,
        enum: [1, 2, 3],
        default: 1,
    },
    active: {
        type: Boolean,
        default: true
    },
    password: {
        type: String,
        required: [true, 'Mật khẩu không được để trống'],
        minlength: [8, 'Mật khẩu phải có ít nhất 8 kí tự'],
        select: false
    },
    passwordConfirm: {
        type: String,
        validate: {
            //only work on CREATE and on Save
            validator: function (el) {
                return el === this.password
            },
            message: 'Mật khẩu không trùng khớp'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    followingProducts: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            size: {
                type: String
            }
        }
    ]
}, {
    toObject:
        { virtuals: true },
    toJSON:
        { virtuals: true }
})

// userSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'followingProducts',
//         populate: {
//             path: product,
//             model 
//         }
//     })
//     next()
// })

userSchema.pre('save', async function (next) {
    // run only when password is modified
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    if (this.role !== 'nguời dùng') {
        this.followingProducts = undefined
        this.level = undefined
        this.shoeSize = undefined
        if (this.role === 'nhân viên xử lý') this.staffCode = 'HANDLER' + this._id.toString().slice(-6).toUpperCase()
        if (this.role === 'nhân viên kiểm tra') this.staffCode = 'CHECKER' + this._id.toString().slice(-6).toUpperCase()
        if (this.role === 'nhân viên hỗ trợ') this.staffCode = 'HELPER' + this._id.toString().slice(-6).toUpperCase()
    }
    next()
})

userSchema.index({name: 'text', staffCode: 'text'})
//check password in log in
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}



const User = mongoose.model('User', userSchema)

module.exports = User