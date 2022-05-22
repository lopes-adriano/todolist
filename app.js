const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const mongoKey = "Credenciais do MongoDB Atlas";

mongoose.connect("mongodb+srv://"+ mongoKey +"@cluster0.2t2gz.mongodb.net/todolistDB");

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Bem-vindo(a) à sua lista de tarefas!",
});

const item2 = new Item({
  name: "Adicione novos itens com o botão de '+'.",
});

const item3 = new Item({
  name: "⬅️ Marque a caixa ao lado para excluir um item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: {type: String, unique: true, required: true, dropDups: true},
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  let day = _.capitalize(date.getDate());

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Sucessfully added default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  
  let day = _.capitalize(date.getDate());
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });
  
  if (listName === day) {
    newItem.save().then(function(result){
      res.redirect("/");
    }); 
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      if (!err) {
        foundList.items.push(newItem);
        foundList.save().then(function(result){
          res.redirect("/" + listName);
        });        
      }
    })
  }

  
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  let day = _.capitalize(date.getDate());
  
  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      } else{
        console.log("Item removed.");
        res.redirect("/");
      }
    }); 
  } else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, 
      function(err, foundList){
        if(!err) {
          res.redirect("/" + listName);
        }
    });
  }
  
  
});

app.get("/:customListName", function (req, res) {

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if(!err){
      if((!foundList) && !customListName.includes("Favicon.ico")) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else if(foundList) {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
});

app.get("/about", function (req, res) {
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has started.");
});
