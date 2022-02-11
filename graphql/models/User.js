const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String,
    role: String,
    value: String,
    label: String,
    cash: Number,
    portfolio: [{
        name: String,
        symbol: String,
        quantity: Number,
        averagePrice: Number,
        purchaseWhen: String
    }],
});

module.exports = model('User', userSchema);