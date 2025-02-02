import React from "react";
import { useParams } from "react-router-dom";

const ImportProductDetail = () => {
  const { id } = useParams();
  console.log("ImportProductDetail ID:", id);

  return (
    <div>
      <h1>Import Product Detail</h1>
      <p>Import ID: {id}</p>
      {/* Add more details about the import here */}
    </div>
  );
};

export default ImportProductDetail;
