const { Product } = require("../../schemas/index");

const getProducts = async (req, res) => {
    try {
        const {
            brand,
            model,
            priceMin,
            priceMax,
            category,
            type,
            page = 1,
        limit = 10,
        sort // Nuevo parámetro para ordenar
    } = req.query;

      const filter = {};

      if (brand) filter.brand = { $regex: new RegExp(brand, "i") };
      if (model) filter.model = { $regex: new RegExp(model, "i") };
      if (priceMin && !isNaN(priceMin)) filter.price = { ...filter.price, $gte: parseFloat(priceMin) };
      if (priceMax && !isNaN(priceMax)) filter.price = { ...filter.price, $lte: parseFloat(priceMax) };
      if (category) filter.category = { $regex: new RegExp(category, "i") };
      if (type) filter.type = { $regex: new RegExp(type, "i") };

      const totalCount = await Product.countDocuments(filter);

      const skip = (page - 1) * limit;

      let productsQuery = Product.find(filter)
          .skip(skip)
          .limit(parseInt(limit));

      if (sort) {
          if (sort === 'price_asc') {
              productsQuery = productsQuery.sort({ price: 1 });
          } else if (sort === 'price_desc') {
              productsQuery = productsQuery.sort({ price: -1 });
          }
      }

      const products = await productsQuery;

      const totalPages = Math.ceil(totalCount / limit);

      res.json({ products, totalPages, currentPage: parseInt(page), totalResults: totalCount });
  } catch (error) {
      res.status(500).json({ error: 'Error al obtener productos' });
  }
};

module.exports = getProducts;