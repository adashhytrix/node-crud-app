const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const itemRoutes = require('./routes/itemRoutes');
const Item = require('./models/Item');
const app = express();
const PORT = 5000;


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
// Middleware
app.use(cors());
// app.use(bodyParser.json());


// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/crud_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes
// app.use('/api/items', itemRoutes);

// Routes
app.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 2;
  const limit = 5;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  // Build filter condition
  const query = {
      $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
      ]
  };

  const totalItems = await Item.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);
  let items;
  if (search.length > 0) {
    items = await Item.find(query); // return all matching items
  } else {
    items = await Item.find(query).skip(skip).limit(limit); // paginated
  }
  

  res.render('index', { items, totalPages, page, search });
});

// app.get('/', async (req, res) => {
//     const items = await Item.find();
//     res.render('index', { items });
//   });
  
  app.get('/add', (req, res) => {
    res.render('add');
  });
  
  app.post('/add', async (req, res) => {
    await new Item(req.body).save();
    res.redirect('/');
  });
  
  app.get('/edit/:id', async (req, res) => {
    const item = await Item.findById(req.params.id);
    res.render('edit', { item });
  });
  
  app.post('/edit/:id', async (req, res) => {
    await Item.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/?page=1');
  });
  
  app.get('/delete/:id', async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.redirect('/');
  });

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
