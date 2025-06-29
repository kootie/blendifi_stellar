import { useState, useEffect } from 'react';
import { useFreighter } from '../hooks/useFreighter';
import { TOKENS, getTokenBalance, getTokenPrice } from '../utils/tokens';
import { stakeBlend, getUserPosition, unstakeBlend, claimRewards } from '../utils/contract';

// Helper for amount conversion
function toContractAmount(amount, decimals) {
  return BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));
}

const Stake = () => {
  const { isConnected, publicKey } = useFreighter();
  const [blendBalance, setBlendBalance] = useState(0);
  const [stakedAmount, setStakedAmount] = useState(0);
  const [rewards, setRewards] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);

  useEffect(() => {
    if (isConnected && publicKey) {
      loadStakingData();
    }
  }, [isConnected, publicKey]);

  const loadStakingData = async () => {
    try {
      const balance = await getTokenBalance(publicKey, 'BLEND');
      setBlendBalance(balance);
      // Fetch real contract data for stakedAmount and rewards
      const position = await getUserPosition(publicKey);
      setStakedAmount(position.staked_blend || 0);
      setRewards(position.rewards_earned || 0);
    } catch (error) {
      console.error('Error loading staking data:', error);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert('Please enter a valid amount to stake');
      return;
    }
    if (parseFloat(stakeAmount) > blendBalance) {
      alert('Insufficient BLEND balance');
      return;
    }
    setIsStaking(true);
    try {
      const contractAmount = toContractAmount(stakeAmount, 7).toString();
      const result = await stakeBlend(publicKey, contractAmount);
      if (result && result.successful) {
        alert('Successfully staked BLEND tokens!');
        setStakeAmount('');
        loadStakingData();
      } else {
        alert('Failed to stake tokens. Please try again.');
      }
    } catch (error) {
      console.error('Staking error:', error);
      alert(`Staking failed: ${error.message}`);
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      alert('Please enter a valid amount to unstake');
      return;
    }
    if (parseFloat(unstakeAmount) > stakedAmount) {
      alert('Insufficient staked amount');
      return;
    }
    setIsUnstaking(true);
    try {
      const contractAmount = toContractAmount(unstakeAmount, 7).toString();
      const result = await unstakeBlend(publicKey, contractAmount);
      if (result && result.successful) {
        alert('Successfully unstaked BLEND tokens!');
        setUnstakeAmount('');
        loadStakingData();
      } else {
        alert('Failed to unstake tokens. Please try again.');
      }
    } catch (error) {
      console.error('Unstaking error:', error);
      alert(`Unstaking failed: ${error.message}`);
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaimRewards = async () => {
    if (rewards <= 0) {
      alert('No rewards to claim');
      return;
    }
    setIsLoading(true);
    try {
      const result = await claimRewards(publicKey);
      if (result && result.successful) {
        alert('Successfully claimed rewards!');
        loadStakingData();
      } else {
        alert('Failed to claim rewards. Please try again.');
      }
    } catch (error) {
      console.error('Claim rewards error:', error);
      alert(`Failed to claim rewards: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const blendPrice = getTokenPrice('BLEND');
  const totalStakedValue = stakedAmount * blendPrice;
  const rewardsValue = rewards * blendPrice;
  const apy = 15.2; // Mock APY

  if (!isConnected) {
    return (
      <div className="text-center">
        <div className="card">
          <h2 className="mb-4">Connect Your Wallet</h2>
          <p className="text-secondary mb-6">
            Please connect your Freighter wallet to stake BLEND tokens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="stake">
      <h1 className="mb-8">Stake BLEND Tokens</h1>

      {/* Staking Overview */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary mb-2">
              {blendBalance.toFixed(2)}
            </div>
            <div className="text-sm text-secondary">Available BLEND</div>
            <div className="text-xs text-secondary mt-1">
              ${(blendBalance * blendPrice).toFixed(2)}
            </div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-success mb-2">
              {stakedAmount.toFixed(2)}
            </div>
            <div className="text-sm text-secondary">Staked BLEND</div>
            <div className="text-xs text-secondary mt-1">
              ${totalStakedValue.toFixed(2)}
            </div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-warning mb-2">
              {rewards.toFixed(2)}
            </div>
            <div className="text-sm text-secondary">Rewards Earned</div>
            <div className="text-xs text-secondary mt-1">
              ${rewardsValue.toFixed(2)}
            </div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary mb-2">
              {apy}%
            </div>
            <div className="text-sm text-secondary">Current APY</div>
            <div className="text-xs text-success mt-1">
              +2.1% from last week
            </div>
          </div>
        </div>
      </section>

      {/* Staking Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stake Tokens */}
        <div className="card">
          <h2 className="mb-6">Stake BLEND</h2>
          <div className="form-group">
            <label className="form-label">Amount to Stake</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              min="0"
              step="0.01"
            />
            <div className="text-sm text-secondary mt-2">
              Available: {blendBalance.toFixed(2)} BLEND
            </div>
          </div>
          
          <div className="form-group">
            <div className="flex justify-between text-sm mb-2">
              <span>Estimated APY:</span>
              <span className="text-success">{apy}%</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span>Estimated Daily Rewards:</span>
              <span className="text-secondary">
                {stakeAmount ? ((parseFloat(stakeAmount) * apy / 100) / 365).toFixed(4) : '0.0000'} BLEND
              </span>
            </div>
          </div>
          
          <button
            onClick={handleStake}
            className="btn btn-primary w-full"
            disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
          >
            {isStaking ? (
              <>
                <div className="spinner"></div>
                Staking...
              </>
            ) : (
              'Stake BLEND'
            )}
          </button>
        </div>

        {/* Unstake Tokens */}
        <div className="card">
          <h2 className="mb-6">Unstake BLEND</h2>
          <div className="form-group">
            <label className="form-label">Amount to Unstake</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              min="0"
              step="0.01"
            />
            <div className="text-sm text-secondary mt-2">
              Staked: {stakedAmount.toFixed(2)} BLEND
            </div>
          </div>
          
          <div className="form-group">
            <div className="flex justify-between text-sm mb-2">
              <span>Unstaking Period:</span>
              <span className="text-warning">7 days</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span>You'll receive:</span>
              <span className="text-secondary">
                {unstakeAmount ? parseFloat(unstakeAmount).toFixed(4) : '0.0000'} BLEND
              </span>
            </div>
          </div>
          
          <button
            onClick={handleUnstake}
            className="btn btn-secondary w-full"
            disabled={isUnstaking || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
          >
            {isUnstaking ? (
              <>
                <div className="spinner"></div>
                Unstaking...
              </>
            ) : (
              'Unstake BLEND'
            )}
          </button>
        </div>
      </div>

      {/* Claim Rewards */}
      <section className="mt-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-2">Claim Rewards</h3>
              <p className="text-secondary">
                You have {rewards.toFixed(2)} BLEND rewards available to claim
              </p>
            </div>
            <button
              onClick={handleClaimRewards}
              className="btn btn-success"
              disabled={isLoading || rewards <= 0}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Claiming...
                </>
              ) : (
                'Claim Rewards'
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Staking Info */}
      <section className="mt-8">
        <div className="card">
          <h3 className="mb-4">How Staking Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl mb-2">🪙</div>
              <h4 className="mb-2">Stake Tokens</h4>
              <p className="text-sm text-secondary">
                Lock your BLEND tokens to earn rewards from protocol fees and incentives.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">📈</div>
              <h4 className="mb-2">Earn Rewards</h4>
              <p className="text-sm text-secondary">
                Earn up to 15.2% APY on your staked tokens, paid out in BLEND.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🔓</div>
              <h4 className="mb-2">Unstake Anytime</h4>
              <p className="text-sm text-secondary">
                Unstake your tokens after a 7-day cooldown period with no penalties.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Stake; 