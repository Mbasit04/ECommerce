import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import {
  addAdminProduct,
  getSellers,
  getCategories,
} from "../../services/adminService";


const AddProduct = () => {

  const navigate = useNavigate();


  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    sellerId: "",
    categoryId: "",
    isActive: true,
  });


  const [sellers, setSellers] =
    useState([]);

  const [categories, setCategories] =
    useState([]);


  const [loading, setLoading] =
    useState(false);

  const [loadingData, setLoadingData] =
    useState(true);


  useEffect(() => {

    loadFormData();

  }, []);


  const loadFormData = async () => {

    try {

      setLoadingData(true);

      const [
        sellersData,
        categoriesData,
      ] = await Promise.all([
        getSellers(),
        getCategories(),
      ]);


      setSellers(sellersData);

      setCategories(categoriesData);

    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to load sellers or categories."
      );

    } finally {

      setLoadingData(false);

    }

  };


  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;


    setForm({
      ...form,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();


    if (
      !form.name ||
      !form.price ||
      !form.stock ||
      !form.sellerId ||
      !form.categoryId
    ) {

      toast.error(
        "Please fill all required fields."
      );

      return;

    }


    try {

      setLoading(true);


      await addAdminProduct({

        name: form.name,

        description:
          form.description,

        price:
          Number(form.price),

        stock:
          Number(form.stock),

        sellerId:
          Number(form.sellerId),

        categoryId:
          Number(form.categoryId),

        isActive:
          form.isActive,

      });


      toast.success(
        "Product added successfully."
      );


      navigate(
        "/admin/products"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Unable to add product."
      );

    } finally {

      setLoading(false);

    }

  };


  if (loadingData) {

    return (

      <div className="text-center mt-5">
        Loading form data...
      </div>

    );

  }


  return (

    <div>

      <h2 className="mb-4">
        Add Product
      </h2>


      <div className="card shadow-sm">

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            {/* Product Name */}

            <div className="mb-3">

              <label className="form-label">
                Product Name *
              </label>

              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
              />

            </div>


            {/* Description */}

            <div className="mb-3">

              <label className="form-label">
                Description
              </label>

              <textarea
                name="description"
                className="form-control"
                rows="4"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter product description"
              />

            </div>


            <div className="row">

              {/* Price */}

              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Price *
                </label>

                <input
                  type="number"
                  name="price"
                  className="form-control"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                />

              </div>


              {/* Stock */}

              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Stock *
                </label>

                <input
                  type="number"
                  name="stock"
                  className="form-control"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  placeholder="Enter stock"
                />

              </div>

            </div>


            <div className="row">

              {/* Seller */}

              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Seller *
                </label>

                <select
                  name="sellerId"
                  className="form-select"
                  value={form.sellerId}
                  onChange={handleChange}
                >

                  <option value="">
                    Select Seller
                  </option>


                  {sellers.map(
                    (seller) => (

                      <option
                        key={seller.id}
                        value={seller.id}
                      >
                        {seller.name ||
                          seller.fullName ||
                          seller.email}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* Category */}

              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Category *
                </label>

                <select
                  name="categoryId"
                  className="form-select"
                  value={form.categoryId}
                  onChange={handleChange}
                >

                  <option value="">
                    Select Category
                  </option>


                  {categories.map(
                    (category) => (

                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name ||
                          category.categoryName}
                      </option>

                    )
                  )}

                </select>

              </div>

            </div>


            {/* Active */}

            <div className="form-check mb-4">

              <input
                type="checkbox"
                name="isActive"
                className="form-check-input"
                checked={form.isActive}
                onChange={handleChange}
                id="isActive"
              />

              <label
                className="form-check-label"
                htmlFor="isActive"
              >
                Product is active
              </label>

            </div>


            <button
              type="submit"
              className="btn btn-primary me-2"
              disabled={loading}
            >

              {loading
                ? "Adding..."
                : "Add Product"}

            </button>


            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                navigate(
                  "/admin/products"
                )
              }
            >
              Cancel
            </button>

          </form>

        </div>

      </div>

    </div>

  );
};


export default AddProduct;