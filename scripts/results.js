const uniqueId = new URLSearchParams(window.location.search).get("id");
const winnerDiv = document.getElementById("winner");

function fetchResults() {
  axios.get(`/getScores/${uniqueId}`)
    .then(response => {
      const scores = response.data;
      const chartData = [];
      const chartLabels = [];
      const chartColors = [];

      const maxVotes = Math.max(...Object.values(scores));
      const winners = Object.entries(scores).filter(([food, score]) => score === maxVotes);

      for (const [food, score] of Object.entries(scores)) {
        chartData.push(score);
        chartLabels.push(food);
        chartColors.push(getRandomColor());
      }

      const ctx = document.getElementById("voteChart").getContext("2d");
      const chart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: chartLabels,
          datasets: [
            {
              data: chartData,
              backgroundColor: chartColors,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
        },
      });

      if (winners.length > 1) {
        // Handle ties
        winnerDiv.textContent = "It's a tie!";
      } else {
        // Display the winner
        const [winner, winnerVotes] = winners[0];
        winnerDiv.innerHTML = `Winner: ${winner} 🏆 <br> ${winnerVotes} votes`;
      }
    })
    .catch(error => {
      console.error("Error fetching results:", error);
    });
}


// Fetch initial results
fetchResults();
setInterval(function() {
    location.reload();
}, 10000); // 10000 milliseconds = 10 seconds

document.getElementById('start-over-btn').addEventListener('click', function() {
  window.location.href = '/';  // This assumes the landing page is the root directory.
});

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

document.getElementById("find-restaurants-btn").addEventListener("click", function() {
  // Get the winner from the winnerDiv
  const winnerText = winnerDiv.textContent;
  if (winnerText.includes("It's a tie!")) {
    alert("There is no single winner. Please try again after the tie is resolved or start over with the top choices.");
    return;
  }

  let winner = winnerText.split(": ")[1].split(" 🏆")[0];

  // Construct the URL for the Google search
  let url = `https://www.google.com/search?q=${winner}+restaurants+near+me`;

  // Open the URL in a new tab
  window.open(url, "_blank");
});




