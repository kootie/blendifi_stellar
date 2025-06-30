import { useEffect, useState } from "react";
import { getPublicKey, requestAccess } from "@stellar/freighter-api";
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
        if (!window.freighterApi) {
          setError("Freighter wallet not found. Please install the Freighter extension.");
          setLoading(false);
          return;
        }
        await requestAccess();
        const pubKey = await getPublicKey();
        setPublicKey(pubKey);

        const allBalances = await getAllBalances(pubKey);
        setBalances(allBalances);
      } catch (err) {
        setError("Error fetching balances: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBalances();
  }, []);

  return { publicKey, balances, error, loading };
} 