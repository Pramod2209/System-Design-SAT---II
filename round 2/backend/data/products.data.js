/**
 * Sample grocery catalog for Quick-Commerce Platform
 * Round 2 Low-Level Design
 */

const initialProducts = [
  {
    productId: "P101",
    name: "Amul Taaza Fresh Toned Milk",
    price: 32,
    category: "Dairy & Breakfast",
    unit: "500 ml",
    brand: "Amul",
    description: "Pasteurised toned milk with 3.0% fat and 8.5% SNF. Rich source of calcium and protein.",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    productId: "P102",
    name: "Modern Artisan Sourdough Whole Wheat Bread",
    price: 48,
    category: "Bakery",
    unit: "400 g",
    brand: "Modern",
    description: "Naturally fermented whole wheat bread baked fresh daily. Zero preservatives.",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    productId: "P103",
    name: "Country Farm Fresh Brown Eggs",
    price: 65,
    category: "Dairy & Breakfast",
    unit: "6 pcs",
    brand: "Eggoz",
    description: "Farm fresh, sanitized brown eggs rich in natural Omega-3 and high quality protein.",
    imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    productId: "P104",
    name: "Epigamia Greek Blueberry Yogurt",
    price: 55,
    category: "Dairy & Breakfast",
    unit: "90 g",
    brand: "Epigamia",
    description: "Thick and creamy strained Greek yogurt layered with real Alphonso blueberries.",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    productId: "P105",
    name: "Fresh Hass Premium Avocados",
    price: 180,
    category: "Fresh Produce",
    unit: "2 pcs (~350g)",
    brand: "FarmFresh",
    description: "Imported creamy Hass avocados, perfectly ripened and ready to eat.",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    productId: "P106",
    name: "Nestle Maggi Special Masala 2-Minute Noodles",
    price: 16,
    category: "Instant & Frozen",
    unit: "70 g",
    brand: "Maggi",
    description: "India's favorite instant noodles infused with 20 signature spices and herbs.",
    imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    productId: "P107",
    name: "Blue Tokai Cold Brew Arabica Coffee Can",
    price: 120,
    category: "Beverages",
    unit: "250 ml",
    brand: "Blue Tokai",
    description: "Steeped for 18 hours for maximum smoothness and zero bitterness. 100% Arabica.",
    imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    productId: "P108",
    name: "Lindt Excellence 70% Dark Chocolate Bar",
    price: 245,
    category: "Snacks & Sweets",
    unit: "100 g",
    brand: "Lindt",
    description: "Master crafted Swiss dark chocolate with balanced floral notes and rich cacao.",
    imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    productId: "P109",
    name: "Fresh Hydroponic Baby Spinach",
    price: 45,
    category: "Fresh Produce",
    unit: "200 g",
    brand: "UrbanGreens",
    description: "Crisp and tender pesticide-free hydroponic spinach leaves, washed and ready to toss.",
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    productId: "P110",
    name: "Borges Extra Virgin Cold Pressed Olive Oil",
    price: 699,
    category: "Cooking Essentials",
    unit: "1 L",
    brand: "Borges",
    description: "First cold-pressed Mediterranean olives preserving aroma, polyphenol antioxidants, and purity.",
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    productId: "P111",
    name: "Mother Dairy Cow Milk Pouch",
    price: 28,
    category: "Dairy & Breakfast",
    unit: "500 ml",
    brand: "Mother Dairy",
    description: "Pure cow milk with natural vitamins A & D for healthy growth and vitality.",
    imageUrl: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    productId: "P112",
    name: "Raw Pressery Cold Pressed Valencia Orange Juice",
    price: 99,
    category: "Beverages",
    unit: "250 ml",
    brand: "RAW",
    description: "100% pure Valencia oranges cold pressed without added sugar, water, or preservatives.",
    imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
];

module.exports = initialProducts;
