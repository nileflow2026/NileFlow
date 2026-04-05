/* resend._domainkey p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCqvrzXsVcWvEWhi4W2AvQJ6DGyRhxS6Ydu17eW9k77p0kf56MdXV3XBFNm5gHFnt03Z+N71KxJCnp4ajb6mqeWToj+R4UKC9iYPv3UG4KgJ117pKX7DFsxfHqyUAIZNBmzxFRdjhD5+oaJ0xXKg2mWsyuMi+wchgnU9n9K46aKfQIDAQAB */

/*  send = feedback-smtp.eu-west-1.amazonses.com */
// for reciept
/* re_2SrRq9Rg_Fq4hVPLk7LxeUtsE3paWwDwX */

/* /*      html: `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
      <div style="background-color: #1c1c1c; padding: 20px;">
        <h1 style="margin: 0; color: #fff; font-size: 24px; text-align: center;">🛍️ Nile Mart</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="font-size: 20px; margin-top: 0;">Hi ${customerName},</h2>
        <p style="font-size: 16px;">Thank you for your purchase! We're happy to confirm your order:</p>

        <div style="background: #f9f9f9; padding: 15px 20px; margin: 20px 0; border-radius: 6px;">
          <p style="margin: 0; font-size: 16px;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Total:</strong> $${orderTotal.toFixed(2)}</p>
        </div>

        <p style="font-size: 16px;">We'll send you another email when your order is on the way.</p>
        <p style="font-size: 16px;">If you have any questions, feel free to reach out to our support team.</p>

        <p style="margin-top: 30px; font-size: 16px;">— The Nile Mart Team</p>
      </div>

      <div style="background-color: #1c1c1c; padding: 15px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #bbb;">
          Nile Mart, South Sudan | <a href="mailto:support@nilemart.com" style="color: #bbb;">support@nilemart.com</a>
        </p>
      </div>
    </div>
  </div>
` */
/*   <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${item.productName}</td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${item.quantity}</td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
                    </tr> */
// for chechout
/*   const initiateCheckout = async () => {
        if (!selectedMethod) {
            Alert.alert("Error", "Please select a payment method.");
            return;
        }
    
        if (cart.length === 0) {
            Alert.alert("Error", "Your cart is empty.");
            return;
        }
    
        setLoading(true);
    
        try {
            const products = cart.map(item => ({
                product_name: item.productName || item.name,
                currency: 'usd',
                price: Math.round(Number(item.price) * 100), 
                quantity: item.quantity
            }));
    
            const userAccount = await getCurrentUser();

            console.log("User Account:", userAccount); 
            
            if (!userAccount || !userAccount.email || !userAccount.username) {
              Alert.alert("Error", "User email not found. Please log in.");
              setLoading(false);
              return;
            }
            
            const customerEmail = userAccount.email; 
            const email = userAccount.email; 
            const userId = userAccount.userId;
            const username = userAccount.username || customerEmail; // Fallback
            console.log('username:', username);
            
            const payload = {
                products: products,
                username: username,
                customerEmail: customerEmail, 
                items: JSON.stringify(products),
                createdAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString(), 
                orderStatus: "Ordered", 
                userId: userId, // Include userId here
                
            
            };


    
            console.log("Payload being sent:", JSON.stringify(payload, null, 2));
    
            const response = await functions.createExecution(
                Config.functionId,
                JSON.stringify(payload)
            );
    
            console.log("Raw API Response:", response.responseBody);
    
            const result = JSON.parse(response.responseBody);
            console.log("Stripe Response:", result);
    
            if (result.client_secret && result.orderId) {
                setOrderId(result.orderId); 
                setCreatedAt(payload.createdAt); // ✅ Store createdAt 

                console.log("Order ID stored:", result.orderId);
    
                const { error } = await initPaymentSheet({
                    paymentIntentClientSecret: result.client_secret,
                    merchantDisplayName: "Your App Name",
                });
    
                if (!error) {
                    const { error: paymentError } = await presentPaymentSheet();
                    if (paymentError) {
                        Alert.alert("Payment Failed", paymentError.message);
                    } else { 
                        await createNotification({
                           message: `🛍️ New order #${result.orderId} placed by ${email} totaling $${totalAmount.toFixed(2)}.`,
                           type: 'order',
                           username: username, 
                           userId,
                           email
                        })
                           

                        router.push({
                            pathname: "/(Screens)/OrdersScreen",
                            // Ensure this is the correct route file
                            params: {
                                
                                orderId: result.orderId,  // Pass order ID
                                totalAmount: totalAmount.toFixed(2),  // Pass total amount
                                paymentMethod: selectedMethod, 
                                orderTime: new Date().toLocaleString(),
                                paymentTime: new Date().toLocaleString(),
                                productsAmount: (totalAmount * 0.90).toFixed(2), // Example: Before tax/fees
                                orderStatus: result.orderStatus || "Ordered",
                                estimatedDelivery: estimatedDelivery,  
                                paymentRef: "PAY_" + Math.floor(Math.random() * 1000000000), 
                                items: JSON.stringify(products), 
                            }
                        });
                    
                        
                      
                    }
                } else {
                    console.error("Error initializing payment sheet:", error);
                    Alert.alert("Error", "Failed to start payment process.");
                }
            } else {
                Alert.alert("Error", "Failed to retrieve payment intent or order ID.");
                console.error("Error: No client secret or order ID received", result);
            }
        } catch (error) {
            console.error("Payment initiation failed:", error);
            Alert.alert("Error", "Payment initiation failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };  */

/*     useEffect(() => {
            const loadReviews = async () => {
                try {
                    const reviewsData = await fetchReviews((product.$id));
                   
                    setReviews(reviewsData);
                } catch (error) {
                    console.error('Failed to fetch reviews:', error);
                }
            };
    
            if (user) {
                console.log("Fetching reviews for new user:", user.userId);
                loadReviews();
            }
        }, [product.$id, user]);  // Now runs when `user` changes  */

// TODO: add the correct default export manually
import { Component } from "react";
import { Text, View } from "react-native";

export default class reuseable extends Component {
  render() {
    return (
      <View>
        <Text>reuseable</Text>
      </View>
    );
  }
}
