import { isConnected as freighterIsConnected } from '@stellar/freighter-api';

export async function checkFreighter() {
  try {
    const result = await freighterIsConnected();
    return result && result.isConnected;
  } catch (e) {
    console.error('Freighter wallet not detected (API error)', e);
    return false;
  }
} 