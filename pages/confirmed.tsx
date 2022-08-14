import React from "react";
import { useRouter } from "next/router";

function Confirmed() {
  const router = useRouter();
  const { query } = router;
  return (
    <div>
      <p>confirmed payment. Thank you.</p>
      <p>
        Amount before discount: {query.amountBeforeDiscount} {query.payCurrency}
      </p>
      <p>
        Discount: {query.discount} {query.payCurrency}
      </p>
      <p>
        Final Amount: {query.finalAmount} {query.payCurrency}
      </p>
      <p>Points recycled back to the shop: {query.pointsToBurn} points</p>
      <p>Points rewarded back to your walet: {query.rewardPoints} points</p>
    </div>
  );
}

export default Confirmed;
