import { useEffect, useState } from "react";
import { requestAccess } from "@stellar/freighter-api";
import { getAllBalances } from "../utils/tokens";

export function useWalletBalances() {
  const [publicKey, setPublicKey] = useState("");
  const [balances, setBalances] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBalances() {
      setLoading(true);
      setError("");
      try {
        // Use only requestAccess and get the address from its return value
        const { address } = await requestAccess();
        setPublicKey(address);
        const allBalances = await getAllBalances(address);
        setBalances(allBalances);
      } catch (err) {
        setError("Freighter wallet not found or not connected. Please ensure the Freighter extension is installed, unlocked, and you have granted access.");
      } finally {
        setLoading(false);
      }
    }
    fetchBalances();
  }, []);

  return { publicKey, balances, error, loading };
} 