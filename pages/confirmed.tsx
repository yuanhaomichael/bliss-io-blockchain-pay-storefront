import React from "react";
import { useRouter } from "next/router";

function Confirmed() {
  const router = useRouter();
  const { query } = router;
  if (query) {
    return (
      <div>
        <p>Confirmed payment. Thank you.</p>
        <p>
          Amount before discount: {query.amountBeforeDiscount} {query.currency}
        </p>
        <p>
          Discount: {query.discount} {query.currency}
        </p>
        <p>
          Final Amount: {query.finalAmount} {query.currency}
        </p>
        <p>
          Points utilized and recycled back to the shop: {query.pointsToBurn}{" "}
          points
        </p>
        <p>Points rewarded back to your walet: {query.rewardPoints} points</p>
      </div>
    );
  } else {
    return <p>Confirmed payment, thank you!</p>;
  }
}

export default Confirmed;
