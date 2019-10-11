const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const typeDefs = gql`
  extend type Query {
    topProducts(first: Int = 5): [Product]
  }

  type Product @key(fields: "upc") {
    upc: String!
    name: String
    price: Int
    weight: Int
    stockData: StockData
  }

  extend type StockData @key(fields: "productUpc") {
    productUpc: String! @external
  }
`;

function addStockDataPlaceholder(product) {
  return {
    ...product,
    stockData: {productUpc: product.upc},
  };
}

const resolvers = {
  Product: {
    __resolveReference(object) {
      return addStockDataPlaceholder(
        products.find(product => product.upc === object.upc));
    }
  },
  Query: {
    topProducts(_, args) {
      return products.slice(0, args.first).map(addStockDataPlaceholder);
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
});

server.listen({ port: 4003 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

const products = [
  {
    upc: "1",
    name: "Table",
    price: 899,
    weight: 100
  },
  {
    upc: "2",
    name: "Couch",
    price: 1299,
    weight: 1000
  },
  {
    upc: "3",
    name: "Chair",
    price: 54,
    weight: 50
  }
];
