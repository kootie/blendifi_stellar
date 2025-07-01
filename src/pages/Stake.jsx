import { useState, useEffect } from 'react';
import { useFreighter } from '../hooks/useFreighter';
import { TOKENS, getTokenBalance } from '../utils/tokens';
import { stakeBlend, unstakeBlend, claimRewards, getUserPosition } from '../utils/contract';

const Stake = () => {
  const { isConnected, publicKey } = useFreighter();
  const [blendBalance, setBlendBalance] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [stakeError, setStakeError] = useState('');
  const [unstakeError, setUnstakeError] = useState('');
  const [claimError, setClaimError] = useState('');
  const [stakeSuccess, setStakeSuccess] = useState(null);
  const [unstakeSuccess, setUnstakeSuccess] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(null);
  const [userPosition, setUserPosition] = useState({ staked_blend: 0, rewards_earned: 0 });

  // Fetch balances and staking position
  const loadData = async () => {
    if (!isConnected || !publicKey) return;
    setIsLoading(true);
    setStakeError('');
    setUnstakeError('');
    setClaimError('');
    try {
      const blend = await getTokenBalance(publicKey, 'BLEND');
      setBlendBalance(parseFloat(blend.balance || 0));
      const position = await getUserPosition(publicKey);
      setUserPosition(position);
    } catch {
      setStakeError('Failed to load balances or staking position.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [isConnected, publicKey]);

  // Stake BLEND
  const handleStake = async () => {
    setStakeError('');
    setStakeSuccess(null);
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setStakeError('Enter a valid amount');
      return;
    }
    setIsStaking(true);
    try {
      const decimals = TOKENS.BLEND.decimals;
      const contractAmount = (parseFloat(stakeAmount) * Math.pow(10, decimals)).toString();
      const result = await stakeBlend(publicKey, contractAmount);
      if (result && result.hash) {
        setStakeSuccess(
          <span>
            Stake successful! <a href={`https://testnet.stellarchain.io/tx/${result.hash}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Tx</a>
          </span>
        );
        setStakeAmount('');
        loadData();
      } else {
        setStakeError(result?.errorResult || result?.status || 'Unknown error');
      }
    } catch {
      setStakeError('Stake failed. Please try again.');
    } finally {
      setIsStaking(false);
    }
  };

  // Unstake BLEND
  const handleUnstake = async () => {
    setUnstakeError('');
    setUnstakeSuccess(null);
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setUnstakeError('Enter a valid amount');
      return;
    }
    setIsUnstaking(true);
    try {
      const decimals = TOKENS.BLEND.decimals;
      const contractAmount = (parseFloat(unstakeAmount) * Math.pow(10, decimals)).toString();
      const result = await unstakeBlend(publicKey, contractAmount);
      if (result && result.hash) {
        setUnstakeSuccess(
          <span>
            Unstake successful! <a href={`https://testnet.stellarchain.io/tx/${result.hash}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Tx</a>
          </span>
        );
        setUnstakeAmount('');
        loadData();
      } else {
        setUnstakeError(result?.errorResult || result?.status || 'Unknown error');
      }
    } catch {
      setUnstakeError('Unstake failed. Please try again.');
    } finally {
      setIsUnstaking(false);
    }
  };

  // Claim Rewards
  const handleClaim = async () => {
    setClaimError('');
    setClaimSuccess(null);
    setIsClaiming(true);
    try {
      const result = await claimRewards(publicKey);
      if (result && result.hash) {
        setClaimSuccess(
          <span>
            Rewards claimed! <a href={`https://testnet.stellarchain.io/tx/${result.hash}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Tx</a>
          </span>
        );
        loadData();
      } else {
        setClaimError(result?.errorResult || result?.status || 'Unknown error');
      }
    } catch {
      setClaimError('Claim failed. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center">
        <div className="card">
          <h2 className="mb-4">Connect Your Wallet</h2>
          <p className="text-secondary mb-6">Please connect your Freighter wallet to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Stake BLEND</h2>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Your BLEND Balance:</span>
          <span className="font-semibold">{blendBalance}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Staked BLEND:</span>
          <span className="font-semibold">{userPosition.staked_blend}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Rewards Earned:</span>
          <span className="font-semibold text-success">{userPosition.rewards_earned}</span>
        </div>
      </div>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleStake(); }}>
        <div>
          <label htmlFor="stakeAmount" className="form-label">Amount to Stake</label>
          <div className="flex gap-2">
            <input
              id="stakeAmount"
              type="number"
              value={stakeAmount}
              onChange={e => setStakeAmount(e.target.value)}
              className="form-input w-full"
              placeholder="0.0"
              min="0"
            />
            <button type="button" className="btn btn-secondary" onClick={() => setStakeAmount(blendBalance)}>
              Max
            </button>
          </div>
        </div>
        {stakeError && <div className="bg-error/10 text-error rounded p-2 text-sm">{stakeError}</div>}
        {stakeSuccess && <div className="bg-success/10 text-success rounded p-2 text-sm">{stakeSuccess}</div>}
        <button type="submit" className="btn btn-logo" disabled={isStaking}>
          {isStaking ? 'Staking...' : 'Stake'}
        </button>
      </form>
      <hr className="my-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Unstake BLEND</h3>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleUnstake(); }}>
        <div>
          <label htmlFor="unstakeAmount" className="form-label">Amount to Unstake</label>
          <div className="flex gap-2">
            <input
              id="unstakeAmount"
              type="number"
              value={unstakeAmount}
              onChange={e => setUnstakeAmount(e.target.value)}
              className="form-input w-full"
              placeholder="0.0"
              min="0"
            />
            <button type="button" className="btn btn-secondary" onClick={() => setUnstakeAmount(userPosition.staked_blend)}>
              Max
            </button>
          </div>
        </div>
        {unstakeError && <div className="bg-error/10 text-error rounded p-2 text-sm">{unstakeError}</div>}
        {unstakeSuccess && <div className="bg-success/10 text-success rounded p-2 text-sm">{unstakeSuccess}</div>}
        <button type="submit" className="btn btn-logo" disabled={isUnstaking}>
          {isUnstaking ? 'Unstaking...' : 'Unstake'}
        </button>
      </form>
      <hr className="my-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Claim Rewards</h3>
      {claimError && <div className="bg-error/10 text-error rounded p-2 text-sm">{claimError}</div>}
      {claimSuccess && <div className="bg-success/10 text-success rounded p-2 text-sm">{claimSuccess}</div>}
      <button className="btn btn-logo" onClick={handleClaim} disabled={isClaiming}>
        {isClaiming ? 'Claiming...' : 'Claim Rewards'}
      </button>
      {isLoading && <div className="mt-4 text-center text-secondary">Loading...</div>}
    </div>
  );
};

export default Stake; 