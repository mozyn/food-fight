document.addEventListener("DOMContentLoaded", function() {
  //grab URL suffix
  const uniqueId = new URLSearchParams(window.location.search).get("id");
  let foodOptions = [];

  //send URL suffix to server to find corresponding foodOptions
  axios.get(`/getOptions/${uniqueId}`)
    .then(response => {
      foodOptions = response.data;
      shuffleArray(foodOptions);
      updateVotingButtons();
    })
    .catch(error => {
      console.error("Error fetching food options:", error);
    });

  // Function to check if a user has already voted on this URL
  function hasUserVoted() {
    return localStorage.getItem(window.location.href) === 'voted';
  }

  // Function to mark that a user has voted on this URL in localStorage
  function markUserAsVoted() {
    localStorage.setItem(window.location.href, 'voted');
  }

  // Function to show a modal with a countdown
  function showModal() {
    $('#alreadyVotedModal').modal('show');

    let countdown = 5;  // Starting value (seconds)

    function updateModal() {
      document.getElementById('countdown').innerText = countdown;

      countdown--;

      if (countdown >= 0) {
        setTimeout(updateModal, 1000); //update every second
      } else {
        // Redirect to results page when countdown reaches 0
        $('#alreadyVotedModal').modal('hide');
        window.location.href = `results.html?id=${uniqueId}`;
      }
    }

    updateModal();
  }

  // Show the modal if the user has voted
  if (hasUserVoted()) {
    showModal();
  }



  function updateVotingButtons() {
    const btn1 = document.getElementById('option1');
    const btn2 = document.getElementById('option2');

    // Reset styles to ensure buttons are visible
    btn1.style.display = "block";
    btn1.style.animation = "";
    btn2.style.display = "block";
    btn2.style.animation = "";

    // If only one option remains, declare it as the winner
    if (foodOptions.length === 1) {
      declareWinner(foodOptions[0]);
      btn1.innerText = '';
      btn2.innerText = '';
      return;
    }

    btn1.innerText = foodOptions[0];
    btn2.innerText = foodOptions[1];
  }


  //shuffle the array before creating the buttons
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  const fastFoods = {
    'burger': '🍔',
    'pizza': '🍕',
    'taco': '🌮',
    'hotdog': '🌭',
    'chicken': '🍗',
    'fries': '🍟',
    'cheese': '🧀',
    'ice cream': '🍦',
    'custard': '🍮',
    'cake': '🍰',
    'sushi': '🍣',
    'steak': '🥩',
    'falafel': '🧆',
    'bbq': '🍖',
    'sandwich': '🥪',
    'pineapple': '🍍',
    'ananas': '🍍',
    'pessi': '🅿',
    'pepsi': '🥤',
    'curly fries': '🍟🌀',
    'loaded fries': '🍟🧀🥓',
    'wings': '🍗🌶️',
    'breadsticks': '🥖',
    'corndogs': '🌭🌽',
    'smoothies': '🥤🍓🍌',
    'milk': '🥛',
    'shawarma': '🌯',
    'kabob': '🍢',
    'biryani': '🍛',
    'fish': '🐟',
    'chips': '🍟',
    'candy': '🍬',
    'ramen': '🍜',
    'noodles': '🍜',
    'spaghetti': '🍝',
    'avocado': '🥑',
    'cereal': '🥣',
    'banana': '🍌',
    'potato': '🥔',

    // Fun Foods
    'unicorn': '🦄',
    'rainbow cake': '🍰🌈',
    'dragon fruit': '🐉🍉',
    'alien burger': '🍔👽',

    // Pizza Toppings
    'pepperoni': '🍕🍖',
    'mushrooms': '🍕🍄',
    'green peppers': '🍕🌶️',
    'olives': '🍕🫒',
    'pineapple topping': '🍕🍍',
    'sausage': '🍕🌭',
    'jalapenos': '🍕🌶️',

    // Breakfast Foods
    'bacon': '🥓',
    'eggs': '🍳',
    'egg': '🥚',
    'pancakes': '🥞',
    'waffles': '🧇',
    'toast': '🍞',
    'jam': '🍓🍞',
    'cereal': '🥣',
    'oatmeal': '🥣🌾',
    'bagel': '🥯',
    'croissant': '🥐',
    'muffin': '🧁',
    'donut': '🍩',
    'honey': '🍯',
    'yogurt': '🥣🍓',
    'granola': '🥣🌾',
    'porridge': '🥣🍚'
  };


  //create confetti style emoji explosion with random direction
  function showConfetti(emoji) {
    const numberOfConfettis = 100;
    for (let i = 0; i < numberOfConfettis; i++) {
      const confetti = document.createElement('span');
      confetti.classList.add('confetti');
      confetti.innerText = emoji;
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.fontSize = `${Math.random() * 36 + 24}px`;
      confetti.style.animationDuration = `${Math.random() * 1 + 1.5}s`;
      confetti.style.animationDelay = `${Math.random() * 1}s`;

      const randomDirection = Math.random();
      confetti.style.setProperty('--random-direction', randomDirection);

      document.body.appendChild(confetti);

      confetti.addEventListener('animationend', () => {
        confetti.remove();
      });
    }
  }

  //find out which option is now on the top button
  function isTopButton(btn) {
    const btnRect = btn.getBoundingClientRect();
    const containerRect = document.querySelector('.fighting-container').getBoundingClientRect();
    return (btnRect.top - containerRect.top) < (containerRect.bottom - btnRect.bottom);
  }

  let votingInProgress = false; // State variable to track the click status

  document.querySelectorAll(".fight-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      // If voting is already in progress, return early to prevent further clicks
      if (votingInProgress) {
        return;
      }

      // Set votingInProgress to true to indicate that voting is now in progress
      votingInProgress = true;

      btn.disabled = true;
      const selectedFoodText = this.innerText.toLowerCase();
      const isMobile = window.innerWidth <= 576;

      let found = false; // Variable to track if food is found

      for (const food in fastFoods) {
        if (selectedFoodText.includes(food)) {
          showConfetti(fastFoods[food]);
          found = true;
          break; // Exit the loop once a match is found
        }
      }

      if (!found) {
        showConfetti('🥊');
      }

      const reEnableButtons = () => {
        document.getElementById("option1").disabled = false;
        document.getElementById("option2").disabled = false;

        // Set votingInProgress to false to indicate that voting is no longer in progress
        votingInProgress = false;
      };

      //if option 1 wins
      if (btn.id === "option1") {
        if (isMobile) {
          this.style.animation = "smackDown 0.5s forwards";
          setTimeout(function() {
            document.getElementById("option2").style.animation = "riseUpDisappear 0.5s forwards";
            foodOptions.splice(1, 1);
            setTimeout(() => {
              updateVotingButtons();
              reEnableButtons();
            }, 600);
          }, 250);
        } else {
          this.style.animation = "hitRight 0.5s forwards";
          setTimeout(function() {
            document.getElementById("option2").style.animation = "knockout 0.5s forwards";
            foodOptions.splice(1, 1);
            setTimeout(() => {
              updateVotingButtons();
              reEnableButtons();
            }, 600);
          }, 500);
        }
      } else {
        if (isMobile) {
          this.style.animation = "smackDown 0.5s forwards";
          setTimeout(function() {
            document.getElementById("option1").style.animation = "fallDownDisappear 0.5s forwards";
            foodOptions.splice(0, 1);
            setTimeout(() => {
              updateVotingButtons();
              reEnableButtons();
            }, 600);
          }, 250);
        } else {
          this.style.animation = "hitLeft 0.5s forwards";
          setTimeout(function() {
            document.getElementById("option1").style.animation = "knockout 0.5s forwards";
            foodOptions.splice(0, 1);
            setTimeout(() => {
              updateVotingButtons();
              reEnableButtons();
            }, 600);
          }, 500);
        }
      }
    });
  });




  function declareWinner(winner) {
    markUserAsVoted();
    console.log("Winner is:", winner);

    axios.post("/saveWinner", { id: uniqueId, winner })
      .then(response => {
        console.log(response.data);
        document.getElementById('winnerName').innerText = winner;
        $('#winnerModal').modal('show');
        showConfetti('🎈');

        setTimeout(() => {
          window.location.href = `results.html?id=${uniqueId}`;
        }, 3000);
      })
      .catch(error => {
        console.error("Error saving winner:", error);
      });
  }
  $('#winnerModal').on('show.bs.modal', function() {
    $('#option1, #option2').hide();
  });

  $('#winnerModal').on('hidden.bs.modal', function() {
    window.location.href = `results.html?id=${uniqueId}`;
  });
});
