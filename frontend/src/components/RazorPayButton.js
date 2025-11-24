import axios from 'axios';
import URI from '../utills';

const RazorpayButton = ({ amount }) => {

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Failed to load Razorpay SDK");
      return;
    }

    // ✅ Step 1: Create order from backend
    const order = await axios.post(`${URI}/payment/create-order`, { amount });

    const options = {
      key: "rzp_test_uoEvO2jxZxqBeZ", // frontend key
      amount: order.data.amount,
      currency: order.data.currency,
      name: "ICA",
      description: "Test Transaction",
      order_id: order.data.id,
      handler: async (response) => {
        // ✅ Step 2: Verify signature
        const verifyRes = await axios.post(`${URI}/payment/verify`, {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        });

        if (verifyRes.data.status === "success") {
          alert("Payment successful!");
          // Further actions like update DB, show success page, etc.
        } else {
          alert("Payment verification failed!");
        }
      },
      theme: {
        color: "#3399cc"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return <button onClick={handlePayment}>Subscribe</button>;
};

export default RazorpayButton;
