import { useEffect, useState } from 'react';
import { WatchWalletChanges } from '@stellar/freighter-api';
import { getTokenBalance } from '../utils/tokens';

export function useWalletWatcher() {
  const [address, setAddress] = useState('');
  const [networkInfo, setNetworkInfo] = useState({});
  const [xlmBalance, setXlmBalance] = useState(null);
  const [blendBalance, setBlendBalance] = useState(null);

  // Watch for address/network changes
  useEffect(() => {
    const watcher = new WatchWalletChanges(1000);
    watcher.watch((watcherResults) => {
      setAddress(watcherResults.address);
      setNetworkInfo({
        network: watcherResults.network,
        passphrase: watcherResults.networkPassphrase
      });
      localStorage.setItem('networkInfo', JSON.stringify({
        network: watcherResults.network,
        passphrase: watcherResults.networkPassphrase
      }));
    });
    return () => watcher.stop();
  }, []);

  // Fetch balances when address or network changes
  useEffect(() => {
    if (!address) {
      setXlmBalance(null);
      setBlendBalance(null);
      return;
    }
    (async () => {
      setXlmBalance('Loading...');
      setBlendBalance('Loading...');
      try {
        const xlm = await getTokenBalance(address, "XLM");
        setXlmBalance(xlm);
      } catch {
        setXlmBalance('Error');
      }
      try {
        const blend = await getTokenBalance(address, "BLEND");
        setBlendBalance(blend);
      } catch {
        setBlendBalance('Error');
      }
    })();
  }, [address, networkInfo.network]);

  return { address, networkInfo, xlmBalance, blendBalance };
} 