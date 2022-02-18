const { model, Schema, Mongoose } = require('mongoose');

const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String,
    role: String,
    value: String,
    label: String,
    cash: String,
    portfolio: [{
        name: String,
        symbol: String,
        quantity: String,
        averagePrice: String,
    }],
});

module.exports = model('User', userSchema);