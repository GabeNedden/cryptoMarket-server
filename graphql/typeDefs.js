const { gql } = require('apollo-server');

module.exports = gql`
    type User {
        id: ID
        email: String
        token: String
        username: String
        portfolio: [Stock]
        createdAt: String
        value: String
        label: String
    }
    type Stock {
        id: ID
        name: String
        quantity: Float
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
    }
`;