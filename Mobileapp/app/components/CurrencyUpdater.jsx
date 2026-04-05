import { useEffect } from "react";
import { updateCurrencyRates } from "../../Context/GlobalProvider";

const CurrencyUpdater = () => {
  useEffect(() => {
    const interval = setInterval(
      () => {
        updateCurrencyRates();
      },
      6 * 60 * 60 * 1000
    ); // Runs every 6 hours

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default CurrencyUpdater;
