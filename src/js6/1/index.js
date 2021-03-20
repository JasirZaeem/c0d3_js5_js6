const express = require("express");

const { gql, UserInputError } = require("apollo-server-express");
const fetch = require("node-fetch");
const path = require("path");

const router = express.Router();
router.use("/", express.static(path.join(__dirname, "public")));

let pokemons = [];

const populatePokemonCache = async () =>
  ({ results: pokemons } = await fetch(
    "https://pokeapi.co/api/v2/pokemon?limit=1500"
  ).then((r) => r.json()));

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

  type Query {
    lessons: [Lesson]
    search(str: String!): [BasicPokemon]
    getPokemon(str: String!): Pokemon
  }
`;

const resolvers = {
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

      const pokemon = pokemons.find(({ name }) => name === str);
      if (!pokemon) throw new UserInputError(`${str} does not exist`);
      // cache image url for future requests
      if (!pokemon.image) {
        const pokemonData = await fetch(pokemon.url).then((r) => r.json());
        pokemon.image = pokemonData.sprites.front_default;
      }
      return pokemon;
    },
  },
};

populatePokemonCache().then();

module.exports = {
  typeDefs,
  resolvers,
  router,
};
