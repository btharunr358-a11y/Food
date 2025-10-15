import React, { useContext, useEffect, useState } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import { StoreContext } from "../../Context/StoreContext";
import "./FoodDisplayFilters.css";

const FoodDisplay = ({ searchQuery = "" }) => {  // ✅ receive searchQuery from props
  const { food_list, menu_list } = useContext(StoreContext);

  // Local states for filters
  const [category, setCategory] = useState("All");
  const [restaurantFilter, setRestaurantFilter] = useState("All");
  const [sortOption, setSortOption] = useState("default");
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    // Extract unique restaurant names from populated restaurantId
    const uniqueRestaurants = [
      ...new Set(food_list.map((item) => item.restaurantId?.name)),
    ];
    setRestaurants(uniqueRestaurants);
  }, [food_list]);

  // ✅ Apply filters and search
  const filteredAndSortedFoodList = [...food_list]
    .filter((item) => {
      const isCategoryMatch = category === "All" || category === item.category;
      const isRestaurantMatch =
        restaurantFilter === "All" ||
        restaurantFilter === item.restaurantId?.name;
      const isSearchMatch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return isCategoryMatch && isRestaurantMatch && isSearchMatch;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "rating_desc":
          return b.rating - a.rating;
        case "rating_asc":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  return (
    <div className="food-display" id="food-display">
      {/* Filter controls */}
      <div className="filter-container">
        {/* Category filter */}
        <div className="filter-group">
          <label>Filter by Category:</label>
          <select onChange={(e) => setCategory(e.target.value)} value={category}>
            <option value="All">All Categories</option>
            {menu_list.map((item, index) => (
              <option key={index} value={item.menu_name}>
                {item.menu_name}
              </option>
            ))}
          </select>
        </div>

        {/* Restaurant filter */}
        <div className="filter-group">
          <label>Filter by Restaurant:</label>
          <select
            onChange={(e) => setRestaurantFilter(e.target.value)}
            value={restaurantFilter}
          >
            <option value="All">All Restaurants</option>
            {restaurants.map((rest, index) => (
              <option key={index} value={rest}>
                {rest}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting */}
        <div className="filter-group">
          <label>Sort by:</label>
          <select
            onChange={(e) => setSortOption(e.target.value)}
            value={sortOption}
          >
            <option value="default">Default</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
            <option value="rating_desc">Rating (High to Low)</option>
            <option value="rating_asc">Rating (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Food list */}
      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {filteredAndSortedFoodList.length > 0 ? (
          filteredAndSortedFoodList.map((item) => (
            <FoodItem
              key={item._id}
              image={item.image}
              name={item.name}
              desc={item.description}
              price={item.price}
              id={item._id}
            />
          ))
        ) : (
          <p className="no-results">No food items found for your search.</p>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;
