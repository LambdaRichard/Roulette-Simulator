
let selectedBetType = null;
let selectedNumber = null;

function selectBet(type, number = null) {
  selectedBetType = type;
  selectedNumber = number;

  const label = number ? type + " " + number : type;
  document.getElementById("selectedBet").textContent = label;
}

const wheelNumbers = [
  "0", "28", "9", "26", "30", "11", "7", "20", "32", "17",
  "5", "22", "34", "15", "3", "24", "36", "13", "1", "00",
  "27", "10", "25", "29", "12", "8", "19", "31", "18", "6",
  "21", "33", "16", "4", "23", "35", "14", "2"
];

let wheelRotation = 0;
let ballRotation = 0;


function drawWheelNumbers() {
  const container = document.getElementById("wheelNumbers");
  const radius = 132;
  
  const pocketSize = 360 / wheelNumbers.length;

  container.innerHTML = "";

  wheelNumbers.forEach(function (number, index) {
    const angle = index * pocketSize + pocketSize / 2;
    const numberElement = document.createElement("div");

    numberElement.className = "wheel-number";
    numberElement.textContent = number;

    numberElement.style.transform =
      "rotate(" + angle + "deg) translateY(-" + radius + "px) rotate(" + -angle + "deg)";

    container.appendChild(numberElement);
  });
}
drawWheelNumbers();

let spinCount = 0;
let balanceHistory = [1000];

const chartCanvas = document.getElementById("balanceChart");

const balanceChart = new Chart(chartCanvas, {
  type: "line",
  data: {
    labels: [0],
    datasets: [
      {
        label: "Balance",
        data: balanceHistory,
        borderColor: "#ffd166",
        backgroundColor: "rgba(255, 209, 102, 0.2)",
        tension: 0.25
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false
      }
    }
  }
});

//let wheelRotation = 0;
//let ballRotation = 0;

async function spin() {

  //let wheelRotation = 0;

  if (!selectedBetType) {
  alert("Choose a bet from the table first.");
  return;
  }

  const betType = selectedBetType;
  const amount = document.getElementById("amount").value;

  const wheel = document.getElementById("wheel");
  const ball = document.getElementById("ball");

  const payload = {
    betType: betType,
    amount: amount
  };

  if (betType === "straight") {
    payload.number = selectedNumber;
  }

  const response = await fetch("http://127.0.0.1:5000/spin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  let wheelRotation = 0;
  const data = await response.json();

  const result = String(data.result);
  const pocketSize = 360 / wheelNumbers.length;
  const resultIndex = wheelNumbers.indexOf(result);
  const resultAngle = resultIndex * pocketSize + pocketSize / 2;

  const extraSpins = 360 * 5;
  wheelRotation += extraSpins - resultAngle;

  wheel.style.transform = "rotate(" + wheelRotation + "deg)";

  ballRotation -= 360 * 7;
  ball.style.transform = "rotate(" + ballRotation + "deg)";

  setTimeout(function () {
    document.getElementById("balance").textContent = data.balance;
    document.getElementById("result").textContent = "Result: " + data.result;

    if (data.profit > 0) {
      document.getElementById("message").textContent = "You won $" + data.profit;
    } else {
      document.getElementById("message").textContent =
        "You lost $" + Math.abs(data.profit);
    }
  }, 4000);
}
async function runSimulation() {
  const betType = selectedBetType;
  const amount = document.getElementById("amount").value;
  //const numberValue = document.getElementById("number").value;
  const spins = document.getElementById("simulationSpins").value;

  const payload = {
    betType: betType,
    amount: amount,
    spins: spins
  };

  if (betType === "straight") {
    payload.number = numberValue;
  }

  const response = await fetch("http://127.0.0.1:5000/simulate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  document.getElementById("balance").textContent = data.finalBalance;

  document.getElementById("simulationStats").textContent =
    "Spins: " + data.spins +
    " | Wins: " + data.wins +
    " | Losses: " + data.losses +
    " | Final Balance: $" + data.finalBalance;

  if (typeof balanceChart !== "undefined") {
    balanceHistory = data.history;

    balanceChart.data.labels = data.history.map(function (_, index) {
      return index;
    });

    balanceChart.data.datasets[0].data = data.history;
    balanceChart.update();
  }
}