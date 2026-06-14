import React, { useMemo, useState } from "react";

function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateBuilding(id) {
  const types = ["Office", "Logistics", "Retail", "Mixed-Use"];
  const locations = ["A-Core", "A-Secondary", "B", "C"];

  const type = pick(types);
  const location = pick(locations);
  const year = randomBetween(1980, 2021);
  const area = randomBetween(4000, 25000);
  const occupancy = randomBetween(55, 98);
  const rent = randomBetween(8, 28);
  const condition = randomBetween(35, 90);

  const locationFactor = {
    "A-Core": 1.35,
    "A-Secondary": 1.15,
    B: 1.0,
    C: 0.8,
  }[location];

  const typeFactor = {
    Office: 1.0,
    Logistics: 0.9,
    Retail: 1.1,
    "Mixed-Use": 1.05,
  }[type];

  const estimatedValue = Math.round(
    area * rent * 12 * (occupancy / 100) * locationFactor * typeFactor * 8
  );

  return {
    id,
    name: `Asset ${id}`,
    type,
    location,
    year,
    area,
    occupancy,
    rent,
    condition,
    estimatedValue,
  };
}

function generatePortfolio() {
  return [generateBuilding(1), generateBuilding(2), generateBuilding(3)];
}

function scorePortfolio(buildings, choices) {
  let score = 0;
  let summary = [];

  buildings.forEach((building) => {
    const action = choices[building.id];

    const age = 2026 - building.year;
    const capexRisk = age > 30 ? 25 : age > 20 ? 15 : 8;
    const conditionPenalty = 100 - building.condition;
    const vacancyPenalty = 100 - building.occupancy;

    if (action === "sell") {
      const sellScore =
        building.estimatedValue * 0.25 +
        building.condition * 6000 -
        capexRisk * 40000 -
        vacancyPenalty * 6000;

      score += sellScore;

      summary.push({
        name: building.name,
        action: "Sell",
        points: Math.round(sellScore),
        text: "Immediate monetization of current asset value.",
      });
    }

    if (action === "hold") {
      const annualCashflow =
        building.area * building.rent * 12 * (building.occupancy / 100) -
        building.area * 12 -
        capexRisk * 50000;

      const holdScore = annualCashflow * 6 + building.condition * 4000;

      score += holdScore;

      summary.push({
        name: building.name,
        action: "Hold",
        points: Math.round(holdScore),
        text: "Stable operation with moderate lifecycle risk.",
      });
    }

    if (action === "invest") {
      const investCost = building.area * 45 + capexRisk * 60000;
      const improvedRent = building.rent * 1.18;
      const improvedOccupancy = Math.min(building.occupancy + 10, 98);

      const improvedCashflow =
        building.area * improvedRent * 12 * (improvedOccupancy / 100) -
        building.area * 10;

      const exitValue = improvedCashflow * 8;
      const investScore = exitValue - investCost;

      score += investScore;

      summary.push({
        name: building.name,
        action: "Invest",
        points: Math.round(investScore),
        text: "Upfront CAPEX, but improved income and exit value.",
      });
    }
  });

  return {
    totalScore: Math.round(score),
    summary,
  };
}

export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [portfolio, setPortfolio] = useState(() => generatePortfolio());
  const [choices, setChoices] = useState({});
  const [result, setResult] = useState(null);

  const allAssigned = useMemo(() => {
    const values = Object.values(choices);
    return (
      values.includes("sell") &&
      values.includes("hold") &&
      values.includes("invest") &&
      values.length === 3
    );
  }, [choices]);

  function assignAction(buildingId, action) {
    const updated = { ...choices };

    Object.keys(updated).forEach((key) => {
      if (updated[key] === action) {
        delete updated[key];
      }
    });

    updated[buildingId] = action;
    setChoices(updated);
  }

  function calculateResult() {
    const scoring = scorePortfolio(portfolio, choices);
    setResult(scoring);
  }

  function newRound() {
    setPortfolio(generatePortfolio());
    setChoices({});
    setResult(null);
  }

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "30px",
        background: "#f4f6f8",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "10px" }}>Portfolio Strategy Game</h1>
        <p style={{ color: "#444", marginBottom: "25px" }}>
          Choose exactly one asset to <strong>Sell</strong>, one to{" "}
          <strong>Hold</strong> and one to <strong>Invest</strong>.
        </p>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Player name
          </label>
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            style={{
              padding: "10px",
              width: "300px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          {portfolio.map((building) => (
            <div
              key={building.id}
              style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>{building.name}</h2>
              <p>
                <strong>Type:</strong> {building.type}
              </p>
              <p>
                <strong>Location:</strong> {building.location}
              </p>
              <p>
                <strong>Year:</strong> {building.year}
              </p>
              <p>
                <strong>Area:</strong> {building.area.toLocaleString()} m²
              </p>
              <p>
                <strong>Occupancy:</strong> {building.occupancy}%
              </p>
              <p>
                <strong>Rent:</strong> €{building.rent}/m²/month
              </p>
              <p>
                <strong>Condition:</strong> {building.condition}/100
              </p>
              <p>
                <strong>Estimated value:</strong> €
                {building.estimatedValue.toLocaleString()}
              </p>

              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => assignAction(building.id, "sell")}
                  style={buttonStyle(
                    choices[building.id] === "sell",
                    "#d97706"
                  )}
                >
                  Sell
                </button>
                <button
                  onClick={() => assignAction(building.id, "hold")}
                  style={buttonStyle(
                    choices[building.id] === "hold",
                    "#2563eb"
                  )}
                >
                  Hold
                </button>
                <button
                  onClick={() => assignAction(building.id, "invest")}
                  style={buttonStyle(
                    choices[building.id] === "invest",
                    "#059669"
                  )}
                >
                  Invest
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "25px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={calculateResult}
            disabled={!allAssigned}
            style={mainButtonStyle(!allAssigned)}
          >
            Calculate Score
          </button>
          <button onClick={newRound} style={secondaryButtonStyle}>
            New Round
          </button>
        </div>

        {!allAssigned && (
          <p style={{ color: "#b91c1c", fontWeight: "bold" }}>
            Please assign exactly one Sell, one Hold and one Invest.
          </p>
        )}

        {result && (
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Result</h2>
            <p>
              <strong>Player:</strong> {playerName || "Anonymous"}
            </p>
            <p
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                margin: "10px 0 20px",
              }}
            >
              Score: €{result.totalScore.toLocaleString()}
            </p>

            <div style={{ display: "grid", gap: "12px" }}>
              {result.summary.map((item, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "14px",
                    background: "#fafafa",
                  }}
                >
                  <p style={{ margin: "0 0 6px", fontWeight: "bold" }}>
                    {item.name} – {item.action}
                  </p>
                  <p style={{ margin: "0 0 6px" }}>{item.text}</p>
                  <p style={{ margin: 0 }}>
                    <strong>Contribution:</strong> €
                    {item.points.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buttonStyle(active, color) {
  return {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: active ? color : "#e5e7eb",
    color: active ? "#fff" : "#111",
    fontWeight: "bold",
  };
}

function mainButtonStyle(disabled) {
  return {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    background: disabled ? "#9ca3af" : "#111827",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "15px",
  };
}

const secondaryButtonStyle = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  cursor: "pointer",
  background: "#fff",
  color: "#111",
  fontWeight: "bold",
  fontSize: "15px",
};
