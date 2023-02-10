import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
  CardActionArea,
  Box
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, cartItems, products, handleAddToCart }) => {
	const { name, rating, image, cost, _id } = product;
	//const formattedCost = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cost);

	const token = localStorage.getItem("token");

  return (
		<Card className="card">
			<CardActionArea>
				<CardMedia component="img" height="140" image={image} />
				<CardContent>
					<Typography variant="h5" component="div">
						{name}
					</Typography>
					<Typography variant="h5" component="div">
						<Box sx={{ fontWeight: "bold", m: 1 }}>${cost}</Box>
					</Typography>
					<Rating name="read-only" value={rating} readOnly />
				</CardContent>
			</CardActionArea>
			<CardActions>
				<Button
					className="button"
					variant="contained"
					fullWidth
				  startIcon={<AddShoppingCartOutlined />}
				  onClick={()=> handleAddToCart(token, cartItems, products, _id, 1, { preventDuplicate: true })}
				>
					add to cart
				</Button>
			</CardActions>
		</Card>
	);
};

export default ProductCard;
