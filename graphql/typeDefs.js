const { gql } = require('apollo-server');

module.exports = gql`
    type User {
        id: ID
        email: String
        token: String
        username: String
        cash: String
        portfolio: [Stock]
        createdAt: String
        value: String
        label: String
    }
    type Stock {
        id: ID
        name: String
        symbol: String
        quantity: String
        averagePrice: String
        purchaseWhen: String
    }
    input StockInput {
        id: ID
        name: String
        symbol: String
        quantity: String
        averagePrice: String
        purchaseWhen: String
    }
    input RegisterInput {
        username: String!
        password: String!
        confirmPassword: String!
        email: String!
    }
    type Query {
        getUser(input: String): User
        getUsers: [User]
    }
    type Mutation {
        register(registerInput: RegisterInput): User!
        login(username: String! password: String!): User!
        updatePortfolio(userId: ID! portfolio: [StockInput]): User!
    }
`;