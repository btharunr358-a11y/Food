import React, { useEffect, useState } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";
import { url } from "../../assets/assets";

const List = () => {
  const [list, setList] = useState([]);

  // Fetch food items
  const fetchList = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${url}/api/food/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Failed to fetch food items");
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      toast.error("Error fetching food list");
    }
  };

  // Remove food item
  const removeFood = async (foodId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${url}/api/food/remove`,
        { id: foodId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Food item removed successfully");
        fetchList();
      } else {
        toast.error("Failed to remove food item");
      }
    } catch (error) {
      console.error("Error removing food item:", error);
      toast.error("Error removing food item");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list">
      <h2>All Food Items</h2>
      <div className="list-table-container">
        <table className="list-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.length > 0 ? (
              list.map((item, index) => (
                <tr key={index}>
                  <td>
                    <img
                      src={`${url}/images/${item.image}`}
                      alt={item.name}
                      className="list-item-image"
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>₹{item.price}</td>
                  <td>{item.category}</td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => removeFood(item._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "#999" }}>
                  No food items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;
