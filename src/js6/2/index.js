const express = require("express");
const {
  gql,
  UserInputError,
  AuthenticationError,
} = require("apollo-server-express");
const fetch = require("node-fetch");
const path = require("path");

const router = express.Router();
router.use("/", express.static(path.join(__dirname, "public")));

let pokemons = [];
const users = {};
const populatePokemonCache = async () =>
  ({ results: pokemons } = await fetch(
    "https://pokeapi.co/api/v2/pokemon?limit=1500"
  ).then((r) => r.json()));

const populateUsers = () => {
  pokemons.forEach((pokemon) => {
    pokemon.lessons = [];
    users[pokemon.name] = pokemon;
  });
};
// Schema
const typeDefs = gql`
  type Lesson {
    title: String
  }

  type Pokemon {
    name: String
    image: String
  }

  type BasicPokemon {
    name: String
  }

  type User {
    name: String
    image: String
    lessons: [Lesson]
  }

  type Query {
    lessons: [Lesson]
    search(str: String!): [BasicPokemon]
    getPokemon(str: String!): Pokemon
    user: User
    login(pokemon: String!): User
  }

  type Mutation {
    enroll(title: String!): User
    unenroll(title: String!): User
  }
`;

const getImage = async (pokemon) => {
  // cache image url for future requests
  if (!pokemon.image) {
    const pokemonData = await fetch(pokemon.url).then((r) => r.json());
    pokemon.image = pokemonData.sprites.front_default;
  }
  return pokemon.image;
};

const getPokemonByName = (name) => {
  const pokemon = users[name];
  if (!pokemon) throw new UserInputError(`${name} does not exist`);
  return pokemon;
};

const resolvers = {
  Pokemon: {
    image: getImage,
  },
  User: {
    image: getImage,
  },
  Query: {
    lessons: () =>
      fetch("https://www.c0d3.com/api/lessons").then((r) => r.json()),

    search: (parent, args) => {
      const str = args.str?.trim();
      if (!str) throw new UserInputError("No search term present");
      return pokemons.filter(({ name }) => name.includes(str));
    },

    getPokemon: async (parent, args) => {
      const str = args.str?.trim();
      if (!str) throw new UserInputError("No search term present");
      return getPokemonByName(str);
    },

    user: async (parent, args, { req }) => {
      const { pokemon } = req.session;
      if (!pokemon) throw new AuthenticationError("Not logged in");
      return getPokemonByName(pokemon);
    },

    login: (parent, { pokemon }, { req }) => {
      req.session.pokemon = pokemon;
      return getPokemonByName(pokemon);
    },
  },
  Mutation: {
    enroll: (parent, { title }, { req }) => {
      const { pokemon: user } = req.session;
      if (!user) throw new AuthenticationError("Not logged in");
      const pokemon = getPokemonByName(user);
      pokemon.lessons = [...pokemon.lessons, { title }];
      return pokemon;
    },
    unenroll: (parent, { title }, { req }) => {
      const { pokemon: user } = req.session;
      if (!user) throw new AuthenticationError("Not logged in");
      const pokemon = getPokemonByName(user);
      pokemon.lessons = pokemon.lessons.filter(
        (lesson) => lesson.title !== title
      );
      return pokemon;
    },
  },
};

populatePokemonCache().then(populateUsers);

module.exports = {
  typeDefs,
  resolvers,
  router,
};
