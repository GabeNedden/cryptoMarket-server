const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String,
    role: String,
    value: String,
    label: String,
    portfolio: [{
        name: String,
        quantity: Number,
        purchasePrice: Number,
        purchaseWhen: String
    }],
});

module.exports = model('User', userSchema);