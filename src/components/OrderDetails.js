import React from "react";
import { Button, IconButton, Stack, Typography, Box } from "@mui/material";

const getOrderDetails = (productCount, shippingCharges, subTotal) => [
	{ label: "Products", prefix: "", value: productCount },
	{ label: "Subtotal", prefix: "$", value: subTotal },
	{ label: "Shipping Charges", prefix: "$", value: shippingCharges },
];

const OrderDetails = ({
	productCount,
	shippingCharges,
	subTotal,
	totalCost,
}) => {
	return (
		<Box m={1} px={2} bgcolor="rgb(255, 255, 255)" borderRadius="5px">
			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<Typography
					color="#3C3C3C"
					padding="0.5rem"
					variant="h5"
					fontWeight="700"
				>
					Order Details
				</Typography>
			</Stack>
			{getOrderDetails(productCount, shippingCharges, subTotal).map((x, id) => (
				<Stack
					key={id}
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Box component="div" padding="0.5rem">
						{x.label}
					</Box>
					<Box component="div" padding="0.5rem">
						{x.prefix}
						{x.value}
					</Box>
				</Stack>
			))}

			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<Typography
					color="#3C3C3C"
					padding="0.5rem"
					variant="h6"
					fontWeight="700"
				>
					Total
				</Typography>
				<Typography
					color="#3C3C3C"
					padding="0.5rem"
					variant="h6"
					fontWeight="700"
				>
					${totalCost}
				</Typography>
			</Stack>
		</Box>
	);
};

export default OrderDetails;
