const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productType: {
      type: String,
      enum: ['Perfume', 'Attar'],
    },
    name: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    size: {
      type: String, // 50ml, 100ml
      required: true
    },
    description : {
        type : String,
        required: true
    },
    category: {
      type: String,
      enum: ['Men', 'Women', 'Unisex','Attar'],
    },
    stock: {
      type: Number,
      default: 0
    },
    images: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
