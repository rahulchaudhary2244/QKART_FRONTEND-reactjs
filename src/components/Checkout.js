import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom, getTotalItems } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";
import OrderDetails from "./OrderDetails";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * @typedef {Object} Address - Data on added address
 *
 * @property {string} _id - Unique ID for the address
 * @property {string} address - Full address string
 */

/**
 * @typedef {Object} Addresses - Data on all added addresses
 *
 * @property {Array.<Address>} all - Data on all added addresses
 * @property {string} selected - Id of the currently selected address
 */

/**
 * @typedef {Object} NewAddress - Data on the new address being typed
 *
 * @property { Boolean } isAddingNewAddress - If a new address is being added
 * @property { String} value - Latest value of the address being typed
 */

// TODO: CRIO_TASK_MODULE_CHECKOUT - Should allow to type a new address in the text field and add the new address or cancel adding new address
/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { String } token
 *    Login token
 *
 * @param { NewAddress } newAddress
 *    Data on new address being added
 *
 * @param { Function } handleNewAddress
 *    Handler function to set the new address field to the latest typed value
 *
 * @param { Function } addAddress
 *    Handler function to make an API call to add the new address
 *
 * @returns { JSX.Element }
 *    JSX for the Add new address view
 *
 */
const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  if (!token) return;
  
  return (
		<Box display="flex" flexDirection="column">
			<TextField
				multiline
				minRows={4}
				placeholder="Enter your complete address"
				value={newAddress.value}
				onChange={(e) =>
					handleNewAddress({
						...newAddress,
						value: e.target.value,
					})
				}
			/>
			<Stack direction="row" my="1rem">
				<Button
					variant="contained"
					onClick={() => addAddress(token, newAddress)}
				>
					Add
				</Button>
				<Button
					variant="text"
					onClick={() =>
						handleNewAddress({
							...newAddress,
							isAddingNewAddress: false,
						})
					}
				>
					Cancel
				</Button>
			</Stack>
		</Box>
	);
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const isLoggedIn = token ? true : false;
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  // Fetch the entire products list
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error",autoHideDuration: 2000, });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",autoHideDuration: 2000,
          }
        );
      }
    }
  };

  // Fetch cart data
  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",autoHideDuration: 2000,
        }
      );
      return null;
    }
  };

  /**
   * Fetch list of addresses for a user
   *
   * API Endpoint - "GET /user/addresses"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
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
  const getAddresses = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",autoHideDuration: 2000,
        }
      );
      return null;
    }
  };

  /**
   * Handler function to add a new address and display the latest list of addresses
   *
   * @param { String } token
   *    Login token
   *
   * @param { NewAddress } newAddress
   *    Data on new address being added
   *
   * @returns { Array.<Address> }
   *    Latest list of addresses
   *
   * API Endpoint - "POST /user/addresses"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
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
  const addAddress = async (token, newAddress) => {
    try {
      // TODO: CRIO_TASK_MODULE_CHECKOUT - Add new address to the backend and display the latest list of addresses
      const API_URL = `${config.endpoint}/user/addresses`;
			const payload = { address: newAddress.value };
			const response = await axios.post(API_URL, payload, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			setAddresses({ ...addresses, all: response.data });
			setNewAddress({ ...newAddress, value: "" });

			return response.data;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",autoHideDuration: 2000,
          }
        );
      }
    }
  };

  /**
   * Handler function to delete an address from the backend and display the latest list of addresses
   *
   * @param { String } token
   *    Login token
   *
   * @param { String } addressId
   *    Id value of the address to be deleted
   *
   * @returns { Array.<Address> }
   *    Latest list of addresses
   *
   * API Endpoint - "DELETE /user/addresses/:addressId"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
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
  const deleteAddress = async (token, addressId) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CHECKOUT - Delete selected address from the backend and display the latest list of addresses
      
			const API_URL= `${config.endpoint}/user/addresses/${addressId}`

			const response = await axios.delete(API_URL, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			setAddresses({ ...addresses, all: response.data, selected: "" });
      return response.data;

    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",autoHideDuration: 2000,
          }
        );
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT - Validate request for checkout
  /**
   * Return if the request validation passed. If it fails, display appropriate warning message.
   *
   * Validation checks - show warning message with given text if any of these validation fails
   *
   *  1. Not enough balance available to checkout cart items
   *    "You do not have enough balance in your wallet for this purchase"
   *
   *  2. No addresses added for user
   *    "Please add a new address before proceeding."
   *
   *  3. No address selected for checkout
   *    "Please select one shipping address to proceed."
   *
   * @param { Array.<CartItem> } items
   *    Array of objects with complete data on products added to the cart
   *
   * @param { Addresses } addresses
   *    Contains data on array of addresses and selected address id
   *
   * @returns { Boolean }
   *    Whether validation passed or not
   *
   */
  const validateRequest = (items, addresses, totalCost) => {
		if (totalCost > parseFloat(localStorage.getItem("balance"))) {
			enqueueSnackbar(
				"You do not have enough balance in your wallet for this purchase",
				{
					variant: "warning",
					autoHideDuration: 2000,
				}
			);
			return false;
		}
		if (addresses.all.length === 0) {
			enqueueSnackbar("Please add a new address before proceeding.", {
				variant: "warning",
				autoHideDuration: 2000,
			});
			return false;
		}
		if (addresses.selected.length === 0) {
			enqueueSnackbar("Please select one shipping address to proceed.", {
				variant: "warning",
				autoHideDuration: 2000,
			});
			return false;
		}

		return true;
  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT
  /**
   * Handler function to perform checkout operation for items added to the cart for the selected address
   *
   * @param { String } token
   *    Login token
   *
   * @param { Array.<CartItem } items
   *    Array of objects with complete data on products added to the cart
   *
   * @param { Addresses } addresses
   *    Contains data on array of addresses and selected address id
   *
   * @returns { Boolean }
   *    If checkout operation was successful
   *
   * API endpoint - "POST /cart/checkout"
   *
   * Example for successful response from backend:
   * HTTP 200
   * {
   *  "success": true
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *  "success": false,
   *  "message": "Wallet balance not sufficient to place order"
   * }
   *
   */
  const performCheckout = async (token, items, addresses, totalCost) => {
    if (!token) return false;
		if (!validateRequest(items, addresses, totalCost)) return false;

		try {
			const API_URL = `${config.endpoint}/cart/checkout`;
			const payload = { addressId: addresses.selected };
			const response = await axios.post(API_URL, payload, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (response.data.success) {
				enqueueSnackbar("Order placed successfully", {
					variant: "success",
					autoHideDuration: 2000,
				});
				localStorage.setItem(
					"balance",
					parseFloat(localStorage.getItem("balance") - totalCost)
				);
				return true;
			}
			return false;
		} catch (err) {
			if (err.response) {
				enqueueSnackbar(err.response.data.message, {
					variant: "error",
					autoHideDuration: 2000,
				});
			} else {
				enqueueSnackbar(
					"Could not place order. Check that the backend is running, reachable and returns valid JSON.",
					{
						variant: "error",
						autoHideDuration: 2000,
					}
				);
			}
			return false;
		}
  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT - Fetch addressses if logged in, otherwise show info message and redirect to Products page


  // Fetch products and cart data on page load
  useEffect(() => {
    const onLoadHandler = async () => {
      if (!isLoggedIn) {
				history.push("/login", { from: "Checkout component" });
				enqueueSnackbar("You must be logged in to access checkout page", {
					variant: "warning",
					autoHideDuration: 2000,
				});
			}

      const productsData = await getProducts();

      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }

      getAddresses(token);
    };
    onLoadHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
		<>
			<Header hasHiddenAuthButtons={true} />
			<Grid container>
				<Grid item xs={12} md={9}>
					<Box className="shipping-container" minHeight="100vh">
						<Typography color="#3C3C3C" variant="h4" my="1rem">
							Shipping
						</Typography>
						<Typography color="#3C3C3C" my="1rem">
							Manage all the shipping addresses you want. This way you won't
							have to enter the shipping address manually with every order.
							Select the address you want to get your order delivered.
						</Typography>
						<Divider />
						<Box>
							{/* TODO: CRIO_TASK_MODULE_CHECKOUT - Display list of addresses and corresponding "Delete" buttons, if present, of which 1 can be selected */}
							{addresses.all.length ? (
								addresses.all.map((x) => (
									<Box
										key={x._id}
										className={
											addresses.selected === x._id
												? "address-item selected"
												: "address-item not-selected"
										}
										onClick={(e) => {
											e.stopPropagation();
											setAddresses({ ...addresses, selected: x._id });
										}}
									>
										<Typography>{x.address}</Typography>
										<Button
											startIcon={<Delete />}
											variant="text"
											onClick={(e) => {
												e.stopPropagation();
												deleteAddress(token, x._id);
											}}
										>
											Delete
										</Button>
									</Box>
								))
							) : (
								<Typography my="1rem">
									No addresses found for this account. Please add one to proceed
								</Typography>
							)}
						</Box>
						{/* TODO: CRIO_TASK_MODULE_CHECKOUT - Dislay either "Add new address" button or the <AddNewAddressView> component to edit the currently selected address */}
						{newAddress.isAddingNewAddress ? (
							<AddNewAddressView
								token={token}
								newAddress={newAddress}
								handleNewAddress={setNewAddress}
								addAddress={addAddress}
							/>
						) : (
							<Button
								color="primary"
								variant="contained"
								id="add-new-btn"
								size="large"
								onClick={() => {
									setNewAddress((currNewAddress) => ({
										...currNewAddress,
										isAddingNewAddress: true,
									}));
								}}
							>
								Add new address
							</Button>
						)}
						<Typography color="#3C3C3C" variant="h4" my="1rem">
							Payment
						</Typography>
						<Typography color="#3C3C3C" my="1rem">
							Payment Method
						</Typography>
						<Divider />

						<Box my="1rem">
							<Typography>Wallet</Typography>
							<Typography>
								Pay ${getTotalCartValue(items)} of available $
								{localStorage.getItem("balance")}
							</Typography>
						</Box>

						<Button
							startIcon={<CreditCard />}
							variant="contained"
							onClick={async () => {
								if (await performCheckout(token, items, addresses, getTotalCartValue(items))) {
									history.push("/thanks", { from: "Checkout Component" });
								}
							}}
						>
							PLACE ORDER
						</Button>
					</Box>
				</Grid>
				<Grid item xs={12} md={3} bgcolor="#E9F5E1">
					<Cart isReadOnly={true} products={products} items={items} />
					<OrderDetails
						productCount={getTotalItems(items)}
						subTotal={getTotalCartValue(items)}
						shippingCharges={0}
						totalCost={getTotalCartValue(items)}
					/>
				</Grid>
			</Grid>
			<Footer />
		</>
	);
};

export default Checkout;
