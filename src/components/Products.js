import { Search, SentimentDissatisfied } from '@mui/icons-material';
import {
    CircularProgress,
    Grid,
    InputAdornment,
    TextField,
    Typography,
    Stack,
} from '@mui/material';
import { Box } from '@mui/system';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { config } from '../App';
import Footer from './Footer';
import Header from './Header';
import './Products.css';
import ProductCard from './ProductCard';
import Cart from './Cart';

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 * @property {string} productId - Unique ID for the product
 */

const Products = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [products, setProducts] = useState([]);
    const [debounceTimeout, setDebounceTimeout] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const isLoggedIn = localStorage.getItem('token') ? true : false;
    const bearerToken = localStorage.getItem('token');

    useEffect(() => {
        performAPICall();
        fetchCart(bearerToken);
    }, []);

    /**
     * Make API call to get the products list and store it to display the products
     *
     * @returns { Array.<Product> }
     *      Array of objects with complete data on all available products
     *
     * API endpoint - "GET /products"
     *
     * Example for successful response from backend:
     * HTTP 200
     * [
     *      {
     *          "name": "iPhone XR",
     *          "category": "Phones",
     *          "cost": 100,
     *          "rating": 4,
     *          "image": "https://i.imgur.com/lulqWzW.jpg",
     *          "_id": "v4sLtEcMpzabRyfx"
     *      },
     *      {
     *          "name": "Basketball",
     *          "category": "Sports",
     *          "cost": 100,
     *          "rating": 5,
     *          "image": "https://i.imgur.com/lulqWzW.jpg",
     *          "_id": "upLK9JbQ4rMhTwt4"
     *      }
     * ]
     *
     * Example for failed response from backend:
     * HTTP 500
     * {
     *      "success": false,
     *      "message": "Something went wrong. Check the backend console for more details"
     * }
     */
    const performAPICall = async () => {
        setLoading(true);
        const API_URL = `${config.endpoint}/products`;
        try {
            const res = await axios.get(API_URL);
            setLoading(false);
            setProducts(res.data);
            return res.data;
        } catch (err) {
            setProducts([]);
            setLoading(false);
            if (err.response && err.response.status === 500) {
                enqueueSnackbar(err.response.data.message, {
                    variant: 'error',
                    autoHideDuration: 2000,
                });
            }
            return [];
        }
    };

    /**
     * Definition for search handler
     * This is the function that is called on adding new search keys
     *
     * @param {string} text
     *    Text user types in the search bar. To filter the displayed products based on this text.
     *
     * @returns { Array.<Product> }
     *      Array of objects with complete data on filtered set of products
     *
     * API endpoint - "GET /products/search?value=<search-query>"
     *
     */
    const performSearch = async (text) => {
        setLoading(true);
        const API_URL = `${config.endpoint}/products/search?value=${text}`;
        try {
            const res = await axios.get(API_URL);
            setLoading(false);
            setProducts(res.data);
            return res.data;
        } catch (err) {
            setProducts([]);
            setLoading(false);
            if (err.response && err.response.status === 500) {
                enqueueSnackbar(err.response.data.message, {
                    variant: 'error',
                    autoHideDuration: 2000,
                });
            }
            return [];
        }
    };

    /**
     * Definition for debounce handler
     * With debounce, this is the function to be called whenever the user types text in the searchbar field
     *
     * @param {{ target: { value: string } }} event
     *    JS event object emitted from the search input field
     *
     * @param {NodeJS.Timeout} debounceTimeout
     *    Timer id set for the previous debounce call
     *
     */
    const debounceSearch = (event, debounceTimeout) => {
        if (debounceTimeout > 0) clearTimeout(debounceTimeout);
        const newTimeout = setTimeout(() => {
            performSearch(event.target.value);
        }, 500);
        setDebounceTimeout(newTimeout);
    };

    const getLoadingProducts = () => (
        <Box component="div" m={30}>
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
            >
                <CircularProgress />
                <Typography variant="caption" display="block">
                    {'Loading Products...'}
                </Typography>
            </Stack>
        </Box>
    );

    const getNoProductsFound = () => (
        <Box component="div" my={10}>
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
            >
                <SentimentDissatisfied />
                <Typography variant="caption" display="block">
                    {'No products found'}
                </Typography>
            </Stack>
        </Box>
    );

    const getSearchBar = () => (
        <TextField
            className="search-desktop"
            size="small"
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <Search color="primary" />
                    </InputAdornment>
                ),
            }}
            placeholder="Search for items/categories"
            name="search"
            onChange={(e) => {
                e.stopPropagation();
                debounceSearch(e, debounceTimeout);
            }}
        />
    );

    /**
     * Perform the API call to fetch the user's cart and return the response
     *
     * @param {string} token - Authentication token returned on login
     *
     * @returns { Array.<{ productId: string, qty: number }> | null }
     *    The response JSON object
     *
     * Example for successful response from backend:
     * HTTP 200
     * [
     *      {
     *          "productId": "KCRwjF7lN97HnEaY",
     *          "qty": 3
     *      },
     *      {
     *          "productId": "BW0jAAeDJmlZCF8i",
     *          "qty": 1
     *      }
     * ]
     *
     * Example for failed response from backend:
     * HTTP 401
     * {
     *      "success": false,
     *      "message": "Protected route, Oauth2 Bearer token not found"
     * }
     */
    const fetchCart = async (token) => {
        if (!token) return;

        try {
            const API_URL = `${config.endpoint}/cart`;
            const res = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCartItems(res.data);
            return res.data;
        } catch (e) {
            if (e.response && e.response.status === 400) {
                enqueueSnackbar(e.response.data.message, { variant: 'error' });
            } else {
                enqueueSnackbar(
                    'Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.',
                    {
                        variant: 'error',
                        autoHideDuration: 2000,
                    }
                );
            }
            setCartItems([]);
            return null;
        }
    };

    // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
    /**
     * Return if a product already is present in the cart
     *
     * @param { Array.<{ productId: String, quantity: Number }> } items
     *    Array of objects with productId and quantity of products in cart
     * @param { String } productId
     *    Id of a product to be checked
     *
     * @returns { Boolean }
     *    Whether a product of given "productId" exists in the "items" array
     *
     */
    const isItemInCart = (items, productId) => {
        return items.map((x) => x.productId).includes(productId);
    };

    /**
     * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
     *
     * @param {string} token
     *    Authentication token returned on login
     * @param { Array.<{ productId: String, quantity: Number }> } items
     *    Array of objects with productId and quantity of products in cart
     * @param { Array.<Product> } products
     *    Array of objects with complete data on all available products
     * @param {string} productId
     *    ID of the product that is to be added or updated in cart
     * @param {number} qty
     *    How many of the product should be in the cart
     * @param {boolean} options
     *    If this function was triggered from the product card's "Add to Cart" button
     *
     * Example for successful response from backend:
     * HTTP 200 - Updated list of cart items
     * [
     *      {
     *          "productId": "KCRwjF7lN97HnEaY",
     *          "qty": 3
     *      },
     *      {
     *          "productId": "BW0jAAeDJmlZCF8i",
     *          "qty": 1
     *      }
     * ]
     *
     * Example for failed response from backend:
     * HTTP 404 - On invalid productId
     * {
     *      "success": false,
     *      "message": "Product doesn't exist"
     * }
     */
    const addToCart = async (
        token,
        items,
        products,
        productId,
        qty,
        options = { preventDuplicate: false }
    ) => {
        if (!token) {
            enqueueSnackbar('Login to add an item to the Cart.', {
                variant: 'warning',
                autoHideDuration: 2000,
            });
            return;
        }

        if (options.preventDuplicate && isItemInCart(items, productId)) {
            enqueueSnackbar(
                'Item already in cart. Use the cart sidebar to update quantity or remove item.',
                {
                    variant: 'warning',
                    autoHideDuration: 2000,
                }
            );
            return;
        }

        try {
            const API_URL = `${config.endpoint}/cart`;
            const payload = { productId: productId, qty: qty };
            const res = await axios.post(API_URL, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCartItems(res.data);
            enqueueSnackbar('Items updated in cart.', {
                variant: 'success',
                autoHideDuration: 2000,
            });
        } catch (e) {
            if (e.response && e.response.status === 400) {
                enqueueSnackbar(e.response.data.message, { variant: 'error' });
            } else {
                enqueueSnackbar(
                    'Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.',
                    {
                        variant: 'error',
                        autoHideDuration: 2000,
                    }
                );
            }
            setCartItems([]);
        }
    };

    return (
        <div>
            <Header hasHiddenAuthButtons={true}>
                {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
                {getSearchBar()}
            </Header>

            {/* Search view for mobiles */}
            <TextField
                className="search-mobile"
                size="small"
                fullWidth
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <Search color="primary" />
                        </InputAdornment>
                    ),
                }}
                placeholder="Search for items/categories"
                name="search"
                onChange={(e) => {
                    e.stopPropagation();
                    debounceSearch(e, debounceTimeout);
                }}
            />
            <Grid container>
                <Grid
                    item
                    sm={12}
                    md={isLoggedIn ? 9 : 12}
                    className="product-grid"
                >
                    <Box className="hero">
                        <p className="hero-heading">
                            India’s{' '}
                            <span className="hero-highlight">
                                FASTEST DELIVERY
                            </span>{' '}
                            to your door step
                        </p>
                    </Box>
                    <Grid
                        item
                        container
                        spacing={2}
                        my={1}
                        justifyContent="center"
                        alignItems="center"
                    >
                        {isLoading ? (
                            getLoadingProducts()
                        ) : products.length ? (
                            products.map((x) => (
                                <Grid item xs={6} md={3} key={x._id}>
                                    <ProductCard
                                        product={x}
                                        cartItems={cartItems}
                                        products={products}
                                        handleAddToCart={addToCart}
                                    />
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={6} md={3}>
                                {getNoProductsFound()}
                            </Grid>
                        )}
                    </Grid>
                </Grid>
                {isLoggedIn && (
                    <Grid item sm={12} md={3} className="cart-background">
                        <Cart
                            products={products}
                            items={cartItems}
                            handleQuantity={addToCart}
                        />
                    </Grid>
                )}
            </Grid>
            <Footer />
        </div>
    );
};

export default Products;
