import AsyncStorage from "@react-native-async-storage/async-storage";
import { Databases, Query } from "appwrite";
import React, { createContext, useContext, useEffect, useState } from "react";
import { client, Config } from "../Appwrite";

const CurrencyContext = createContext();
export const useCurrency = () => useContext(CurrencyContext);

const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
  KES: "KSh",
  SSP: "SSP",
};

const databases = new Databases(client);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState("KES");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchExchangeRate = async (selectedCurrency) => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        Config.databaseId,
        Config.currenciesCollection,
        [Query.equal("currency_code", selectedCurrency)]
      );

      if (response.documents.length > 0) {
        const rate = response.documents[0].rate;
        setExchangeRate(rate);
      } else {
        setExchangeRate(1);
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeRate(1);
    } finally {
      setLoading(false);
    }
  };

  const changeCurrency = async (newCurrency) => {
    setCurrency(newCurrency);
    await AsyncStorage.setItem("userCurrency", newCurrency);
    fetchExchangeRate(newCurrency);
  };

  const convertPrice = (priceInUSD) => {
    if (!priceInUSD || isNaN(priceInUSD)) {
      return "Price on request";
    }
    const symbol = currencySymbols[currency] || "KSh";
    return `${symbol} ${(priceInUSD * exchangeRate).toFixed(2)}`;
  };

  useEffect(() => {
    const loadCurrency = async () => {
      const savedCurrency =
        (await AsyncStorage.getItem("userCurrency")) || "KES";
      setCurrency(savedCurrency);
      fetchExchangeRate(savedCurrency);
    };
    loadCurrency();
  }, []);

  return (
    <CurrencyContext.Provider
      value={{ currency, changeCurrency, convertPrice, loading }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
