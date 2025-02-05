const express = require('express');
const { resolve } = require('path');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = 3010;

app.use(express.static('static'));

// Middleware
app.use(bodyParser.json());

// MongoDB Atlas Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define MenuItem Schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

// Routes

// POST /menu - Add new menu item
app.post("/menu", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    const newItem = new MenuItem({ name, description, price });
    await newItem.save();
    res.status(201).json({ message: "Menu item added", item: newItem });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /menu - Fetch all menu items
app.get("/menu", async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /menu/:id - Update an existing menu item
app.put("/menu/:id", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { name, description, price },
      { new: true, runValidators: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json({ message: "Menu item updated", item: updatedItem });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /menu/:id - Delete a menu item
app.delete("/menu/:id", async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json({ message: "Menu item deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
