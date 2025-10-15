import React, { useState, useEffect } from 'react';
import './Add.css';
import { assets, url } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = () => {
    const [image, setImage] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Salad",
        restaurantId: ""
    });

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    const fetchRestaurants = async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                toast.error("Please login first");
                window.location.href = '/login';
                return;
            }

            const response = await axios.get(`${url}/api/restaurant/list`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                setRestaurants(response.data.data);
                // Set the default restaurantId to the first restaurant in the list
                if (response.data.data.length > 0) {
                    setData(prevData => ({ ...prevData, restaurantId: response.data.data[0]._id }));
                }
            } else {
                toast.error("Error fetching restaurants");
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

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!image) {
            toast.error('Image not selected');
            return;
        }

        const token = getAuthToken();
        if (!token) {
            toast.error("Please login first");
            window.location.href = '/login';
            return;
        }

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("category", data.category);
        formData.append("image", image);
        formData.append("restaurantId", data.restaurantId);

        try {
            const response = await axios.post(`${url}/api/food/add`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data.success) {
                toast.success(response.data.message);
                setData({
                    name: "",
                    description: "",
                    price: "",
                    category: data.category,
                    restaurantId: data.restaurantId
                });
                setImage(false);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error adding food:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                toast.error("Error adding food item");
            }
        }
    };

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className='add-img-upload flex-col'>
                    <p>Upload image</p>
                    <input onChange={(e) => { setImage(e.target.files[0]); e.target.value = '' }} type="file" accept="image/*" id="image" hidden />
                    <label htmlFor="image">
                        <img src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
                    </label>
                </div>
                <div className='add-product-name flex-col'>
                    <p>Product name</p>
                    <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Type here' required />
                </div>
                <div className='add-product-description flex-col'>
                    <p>Product description</p>
                    <textarea name='description' onChange={onChangeHandler} value={data.description} type="text" rows={6} placeholder='Write content here' required />
                </div>
                <div className='add-category-price'>
                    <div className='add-category flex-col'>
                        <p>Product category</p>
                        <select name='category' onChange={onChangeHandler} value={data.category}>
                            <option value="Non-VegBiryani">Non-Veg Biryani</option>
                            <option value="Rolls">Rolls</option>
                            <option value="Deserts">Deserts</option>
                            <option value="Sandwich">Sandwich</option>
                            <option value="Cake">Cake</option>
                            <option value="Pure Veg">Pure Veg</option>
                            <option value="Pasta">Pasta</option>
                            <option value="Noodles">Noodles</option>
                        </select>
                    </div>
                    <div className='add-price flex-col'>
                        <p>Product Price</p>
                        <input type="Number" name='price' onChange={onChangeHandler} value={data.price} placeholder='25' required />
                    </div>
                </div>
                <div className='add-restaurant flex-col'>
                    <p>Select Restaurant</p>
                    <select name='restaurantId' onChange={onChangeHandler} value={data.restaurantId} required>
                        {restaurants.length > 0 ? (
                            restaurants.map(restaurant => (
                                <option key={restaurant._id} value={restaurant._id}>
                                    {restaurant.name}
                                </option>
                            ))
                        ) : (
                            <option value="">No restaurants available</option>
                        )}
                    </select>
                </div>
                <button type='submit' className='add-btn'>ADD</button>
            </form>
        </div>
    );
};

export default Add;