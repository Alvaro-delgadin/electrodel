export default function groupProducts(products) {
  return Object.values(
    products.reduce((acc, product) => {
      const key = product.product?.toLocaleLowerCase?.() || "";
      if (!acc[key]) acc[key] = [];
      acc[key].push(product);
      return acc;
    }, {})
  );
}
