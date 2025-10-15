import React, { useState, useEffect } from 'react';
import './List/List.css';
 // Correct path to your CSS
import { url } from '../assets/assets'; // Corrected path
import axios from 'axios';
import { toast } from 'react-toastify';

const ListRestaurant = () => {
    const [list, setList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all restaurants from API
    const fetchList = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Please login first");
                window.location.href = '/login';
                return;
            }

            const response = await axios.get(`${url}/api/restaurant/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setList(response.data.data);
                setFilteredList(response.data.data);
            } else {
                toast.error("Failed to fetch restaurants");
            }
        } catch (error) {
            console.error("Error fetching restaurants:", error);
            toast.error("Error fetching restaurants");
        }
    };

    // Remove a restaurant
    const removeRestaurant = async (restaurantId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${url}/api/restaurant/remove`, { id: restaurantId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success("Restaurant removed successfully");
                fetchList();
            } else {
                toast.error("Error removing restaurant");
            }
        } catch (error) {
            console.error("Error removing restaurant:", error);
            toast.error("Error removing restaurant");
        }
    };

    // Handle search input change
    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (!term) {
            setFilteredList(list);
            return;
        }

        const filtered = list.filter(r =>
            r.name.toLowerCase().includes(term.toLowerCase()) ||
            (r.address && r.address.toLowerCase().includes(term.toLowerCase()))
        );

        if (filtered.length === 0) {
            toast.info("No restaurant matches your search");
        }

        setFilteredList(filtered);
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <div className='list-restaurant'>
            <h2>All Restaurants</h2>

            {/* Search Box */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search restaurant or food item..."
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid #fc8019',
                        width: '300px',
                        maxWidth: '90%',
                        fontSize: '1rem'
                    }}
                />
            </div>

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
                        {filteredList.length > 0 ? (
                            filteredList.map((restaurant, index) => (
                                <tr key={index}>
                                    <td>
                                        <img
                                            src={`${url}/images/${restaurant.image}`}
                                            alt={restaurant.name}
                                            style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px' }}
                                        />
                                    </td>
                                    <td>{restaurant.name}</td>
                                    <td>{restaurant.address}</td>
                                    <td>
                                        <button
                                            onClick={() => removeRestaurant(restaurant._id)}
                                            className='remove-btn'
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                                    No restaurants found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ListRestaurant;
