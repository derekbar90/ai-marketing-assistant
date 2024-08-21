import React, { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Input } from "./components/ui/input";
import "./styles.css";

const SteerTokenomicsSimulatorAccumulatedFees = () => {
  const [params, setParams] = useState({
    initialSupply: 1000000,
    inflationRate: 2,
    dailyTransactionVolume: 1000000,
    stakingRatio: 30,
    appStoreFeeRate: 1,
    bridgeFeeRate: 0.1,
    burnRateFromFees: 20,
    externalDemand: 500000,
    marketVolatility: 5,
  });

  const [ecosystemState, setEcosystemState] = useState({
    circulatingSupply: params.initialSupply,
    stakedTokens: params.initialSupply * (params.stakingRatio / 100),
    tokenPrice: 1,
    tvl: params.initialSupply,
    cumulativeRevenue: 0,
    cumulativeTokensBurned: 0,
    cumulativeAppStoreFees: 0,
    cumulativeBridgeFees: 0,
  });

  const [calculationDetails, setCalculationDetails] = useState({});
  const [history, setHistory] = useState([]);
  const [timeStep, setTimeStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      simulateEcosystemStep();
      setTimeStep((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [params, ecosystemState]);

  const simulateEcosystemStep = () => {
    const {
      circulatingSupply,
      stakedTokens,
      tokenPrice,
      tvl,
      cumulativeRevenue,
      cumulativeTokensBurned,
      cumulativeAppStoreFees,
      cumulativeBridgeFees,
    } = ecosystemState;

    // Detailed calculations
    const newTokensMinted =
      circulatingSupply * (params.inflationRate / 100 / 365);
    const dailyAppStoreFees =
      params.dailyTransactionVolume * (params.appStoreFeeRate / 100);
    const dailyBridgeFees =
      params.dailyTransactionVolume * (params.bridgeFeeRate / 100);
    const dailyTotalFees = dailyAppStoreFees + dailyBridgeFees;
    const dailyTokensToBurn = dailyTotalFees * (params.burnRateFromFees / 100);
    const stakingRewards = newTokensMinted * (params.stakingRatio / 100);
    const newCirculatingSupply =
      circulatingSupply + newTokensMinted - dailyTokensToBurn;

    const demandChange =
      (Math.random() - 0.5) * 2 * (params.marketVolatility / 100);
    const newExternalDemand = params.externalDemand * (1 + demandChange);
    const newTokenPrice =
      tokenPrice *
      (1 + (newExternalDemand - params.externalDemand) / params.externalDemand);

    const newStakedTokens = stakedTokens + stakingRewards;
    const newTVL = newCirculatingSupply * newTokenPrice;
    const newCumulativeRevenue = cumulativeRevenue + dailyTotalFees;
    const newCumulativeTokensBurned =
      cumulativeTokensBurned + dailyTokensToBurn;
    const newCumulativeAppStoreFees =
      cumulativeAppStoreFees + dailyAppStoreFees;
    const newCumulativeBridgeFees = cumulativeBridgeFees + dailyBridgeFees;

    // Update ecosystem state
    const newState = {
      circulatingSupply: newCirculatingSupply,
      stakedTokens: newStakedTokens,
      tokenPrice: newTokenPrice,
      tvl: newTVL,
      cumulativeRevenue: newCumulativeRevenue,
      cumulativeTokensBurned: newCumulativeTokensBurned,
      cumulativeAppStoreFees: newCumulativeAppStoreFees,
      cumulativeBridgeFees: newCumulativeBridgeFees,
    };

    setEcosystemState(newState);
    setHistory((prev) => [...prev, { ...newState, timeStep }].slice(-100));

    // Update calculation details
    setCalculationDetails({
      newTokensMinted,
      dailyAppStoreFees,
      dailyBridgeFees,
      dailyTotalFees,
      dailyTokensToBurn,
      stakingRewards,
      demandChange,
      newExternalDemand,
    });
  };

  const handleParamChange = (param, value) => {
    setParams((prev) => ({ ...prev, [param]: Number(value) }));
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Steer Tokenomics Simulator (Accumulated Fees)
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Ecosystem Parameters</h2>
          <div className="space-y-4">
            {Object.entries(params).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => handleParamChange(key, e.target.value)}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">
            Current Ecosystem State
          </h2>
          <div className="space-y-2">
            {Object.entries(ecosystemState).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                  :
                </span>
                <span className="font-semibold">
                  {typeof value === "number"
                    ? value.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })
                    : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Daily Calculations</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(calculationDetails).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span>
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
                :
              </span>
              <span className="font-semibold">
                {value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Ecosystem Trends</h2>
        <LineChart width={800} height={400} data={history}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timeStep" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="circulatingSupply"
            stroke="#8884d8"
            name="Circulating Supply"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="stakedTokens"
            stroke="#82ca9d"
            name="Staked Tokens"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="tokenPrice"
            stroke="#ffc658"
            name="Token Price"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="tvl"
            stroke="#ff7300"
            name="TVL"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="cumulativeRevenue"
            stroke="#0088FE"
            name="Cumulative Revenue"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="cumulativeTokensBurned"
            stroke="#00C49F"
            name="Cumulative Tokens Burned"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="cumulativeAppStoreFees"
            stroke="#FFBB28"
            name="Cumulative App Store Fees"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="cumulativeBridgeFees"
            stroke="#FF8042"
            name="Cumulative Bridge Fees"
          />
        </LineChart>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div>
      <SteerTokenomicsSimulatorAccumulatedFees />
    </div>
  );
}
