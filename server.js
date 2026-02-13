require('dotenv').config();

const app = require('./app');
const mongoose = require('mongoose');
const dbUrl = process.env.Atlasdb;

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch((err) => console.error('❌ MongoDB error:', err));

main().then(()=>{
    console.log('connection is built');
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

