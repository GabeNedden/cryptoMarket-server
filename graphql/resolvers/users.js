const bcrypt             = require('bcryptjs');
const jwt                = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const checkAuth = require('../../utilities/check-auth');

const { validateRegisterInput, validateLoginInput } = require('../../utilities/validators');

const User                      = require('../models/User');

function generateToken(user){
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username
        },
        process.env.SECRET_KEY,
        { expiresIn: '1h' }
    );
}

module.exports = {
    Query: {
        async getUser(_, { input }){
            try{
                const users = await User.find();
                let user = users.find(user => user.id == input || user.username == input || user.email == input );
                if(user){
                    return user;
                } else {
                    throw new UserInputError("User does not exist")
                }
            } catch(err){
                throw new Error(err);
            }
        },

        async getUsers(){
            try{
                const users = await User.find().sort({ createdAt: -1 });
                return users;
            } catch(err){
                throw new Error(err);
            }
        }
    },

    Mutation: {
        async updatePortfolio(_, { userId, stockInput: {action, name, symbol, quantity, price} }, context){

            quantity = parseFloat(quantity);
            price = parseFloat(price);

            try{
                const userDocument = await User.findById(userId);
                if(userDocument){

                    const stockIndex = userDocument.portfolio.findIndex((s) => s.name === name);
                    const cost = price * quantity;

                    if(stockIndex == -1){
                        // Adding New Stock to Portfolio
                        if(action === 'Buy' && parseFloat(userDocument.cash) >= cost){
                            userDocument.portfolio.unshift({
                                name,
                                symbol,
                                quantity,
                                averagePrice: price
                            })
                            userDocument.cash = parseFloat(userDocument.cash) - cost;

                        } else if(action === 'Sell'){
                            throw new UserInputError("Stock not found in Portfolio");
                        }
                        
                    } else {
                        // Updating Existing Stock in Portfolio
                        stock = userDocument.portfolio[stockIndex]

                        if(action === 'Buy' && parseFloat(userDocument.cash) >= cost){
                            stock.averagePrice = ((parseFloat(stock.quantity) * parseFloat(stock.averagePrice)) + cost) / (parseFloat(quantity) + parseFloat(stock.quantity));
                            stock.quantity = parseFloat(stock.quantity) + quantity;
                            userDocument.cash = parseFloat(userDocument.cash) - cost;

                        } else if(action === 'Sell'){
                            stock.quantity = parseFloat(stock.quantity) - quantity;
                            userDocument.cash = parseFloat(userDocument.cash) + cost;
                        };
                    }
                
                    await userDocument.save()
                    return userDocument;
                } else {
                    throw new UserInputError('User does not exist');
                }
            } catch(err){
                throw new Error(err);
            }
        },

        async login(_, { username, password }){
            const {errors, valid} = validateLoginInput(username, password);

            if(!valid){
                throw new UserInputError('Errors', { errors });
            }

            const user = await User.findOne({ username });

            if(!user){
                errors.general = 'User not found';
                throw new UserInputError('User not found', {errors});
            }

            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = 'Wrong Credentials';
                throw new UserInputError('Wrong Credentials', {errors});
            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            };
        },
        // Register
        async register(_, {
            registerInput: { 
                username, 
                email, 
                password, 
                confirmPassword 
                }
            })
        
        {
            // Validate user data
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);

            if(!valid){
                throw new UserInputError('Errors', { errors });
            }
            // Make sure user doesnt already exist
            const user = await User.findOne({ username });
            if(user){
                throw new UserInputError('Username is taken!', {
                    errors: {
                        username: 'This username is taken'
                    }
                });
            }
            // Make sure email is unique
            const userEmail = await User.findOne({ email });
            if(userEmail){
                throw new UserInputError('Email is in use', {
                    errors: {
                        email: 'This email is already in use'
                    }
                });
            }
            // hash password and create auth token
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString(),
                role: "Default",
                cash: 50000,
                portfolio: [{name: "Bitcoin", symbol: 'BTC', quantity: 1, averagePrice: 42000}],
                value: username,
                label: username,
            });

            const res = await newUser.save();

            const token = generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token
            };
        }
    }
};