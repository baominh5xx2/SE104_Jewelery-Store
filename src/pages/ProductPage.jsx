// ...existing imports...

const ProductPage = () => {
  // ...existing code...

  return (
    // ...existing JSX...
    <ProductSearchModal
      isVisible={isModalVisible}
      onCancel={handleModalClose}
      onConfirm={handleProductSelect}
      isProductPage={true}  // Thêm prop này
    />
    // ...existing JSX...
  );
};
