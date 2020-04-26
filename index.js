//jshint esversion:9

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const axios = require("axios");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

let finalRecipes = [];
let specials = [];

app.get("/", (req, res) => {
  axios.get("http://localhost:3001/recipes")
    .then(recipeList => {
      let recipes = recipeList.data;
      axios.get("http://localhost:3001/specials")
        .then(specialsList => specials = specialsList.data)
        .catch(err => console.log(err))
        .finally(() => {
          finalRecipes = recipes.map(recipe => {

            let modifiedIngredients = recipe.ingredients.map(ingredient => {
              let newIngredient = ingredient;

              let specialDescription = specials.find((description) => {
                return description.ingredientId === ingredient.uuid;
              });

              if (specialDescription) {
                newIngredient = {
                  ...ingredient,
                  ...specialDescription
                };
              }

              return newIngredient;
            });

            return {
              ...recipe,
              ["ingredients"]: modifiedIngredients
            };
          });
          res.render("home", {
            recipes: finalRecipes,
            specials: specials
          });
        });
    })
    .catch(err => console.log(err));
});

app.get("/recipes/:id", (req, res) => {
  let foundRecipe = finalRecipes.find((recipe) => {
    return recipe.uuid === req.params.id;
  });

  console.log(JSON.stringify(foundRecipe));

  if (foundRecipe) {

    res.render("recipe", {
      recipe: foundRecipe
    });
  }
});

app.listen(3000, function() {
  console.log("Server is running on port 3000.");
});
