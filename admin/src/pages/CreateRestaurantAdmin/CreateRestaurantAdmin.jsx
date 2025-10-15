import React, { useState, useEffect } from 'react';
import '../List/List.css';


import { url } from "../../assets/assets";

import axios from 'axios';
import { toast } from 'react-toastify';

const ListRestaurant = () => {
    const [list, setList] = useState([]);

    const fetchList = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Please login first");
                window.location.href = '/login';
                return;
            }

            const response = await axios.get(`${url}/api/restaurant/list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setList(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching restaurants:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                toast.error("Error fetching restaurants");
            }
        }
    };

    const removeRestaurant = async (restaurantId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${url}/api/restaurant/remove`, { id: restaurantId }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data.success) {
                toast.success("Restaurant removed successfully");
                fetchList();
            } else {
                toast.error("Error removing restaurant");
            }
        } catch (error) {
            console.error("Error removing restaurant:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                toast.error("Error removing restaurant");
            }
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <div className='list-restaurant'>
            <h2>All Restaurants</h2>
            <div className="list-restaurant-table">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((restaurant, index) => (
                            <tr key={index}>
                                <td><img src={`${url}/images/${restaurant.image}`} alt={restaurant.name} /></td>
                                <td>{restaurant.name}</td>
                                <td>{restaurant.address}</td>
                                <td>
                                    <button onClick={() => removeRestaurant(restaurant._id)} className='remove-btn'>Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListRestaurant;
