$(document).ready(function() {

  // Initialize the tooltip
  $('[data-toggle="tooltip"]').tooltip();

  let foods = [];

  // Enable link generation only when there are 2+ items
  function updateGenerateLinkButtonState() {
    const button = $("#generate-link");
    if (foods.length >= 2) {
      button.prop('disabled', false);
      button.parent().tooltip('disable');
    } else {
      button.prop('disabled', true);
      button.parent().tooltip('enable');
    }
  }

  // Add swipe functionality
  function addSwipeHandler(element) {
    const hammer = new Hammer(element);
    hammer.on('panstart', handlePanStart);
    hammer.on('panmove', handlePanMove);
    hammer.on('panend', handlePanEnd);

  }

  function handlePanStart(event) {
    const swipedElement = $(event.target).closest('li');
    swipedElement.addClass('panning');
  }

  function handlePanMove(event) {
    const swipedElement = $(event.target).closest('li');
    if (swipedElement.hasClass('panning')) {
      if (Math.abs(event.deltaY) > 5) {
        // If vertical movement is detected, return the element to its original position
        swipedElement.css('transform', 'translateX(0)');
      } else {
        // If no vertical movement is detected, perform the swipe
        swipedElement.css('transform', `translateX(${event.deltaX}px)`);
      }
    }
  }

  function handlePanEnd(event) {
    const swipedElement = $(event.target).closest('li');
    swipedElement.removeClass('panning');

    const threshold = 100; // Set the threshold value in pixels

    // If swiped, remove from list
    if (Math.abs(event.deltaX) > threshold) {
      const foodToRemove = swipedElement.attr('data-food');
      const index = foods.indexOf(foodToRemove);
      // If food exists, remove it from list
      if (index > -1) {
        foods.splice(index, 1);
      }
      // If movement detected is positive on the X-axis then it was swiped to the right and vice versa
      const swipeDirection = event.deltaX > 0 ? 'swiped-right' : 'swiped-left';
      swipedElement.addClass(swipeDirection);
      setTimeout(() => {
        swipedElement.remove();
        updateGenerateLinkButtonState();
      }, 500); // Remove the element after the animation duration
    } else {
      // If the swipe does not exceed the threshold, return the element to its original position
      swipedElement.css('transform', 'translateX(0)');
    }
  }

  // ATTEMPT TO FIX ACCIDENTAL SWIPE WHILE SCROLLING
  // Add a touchend event listener to the swiped element
  document.addEventListener('touchend', function(event) {
    const swipedElement = $(event.target).closest('li');
    const transformValue = swipedElement.css('transform');
    const matrix = transformValue.replace(/[^0-9\-.,]/g, '').split(',');
    const x = parseFloat(matrix[12] || matrix[4]); // Get the X translation value

    // Check if the element is stuck in an offset position
    if (Math.abs(x) < threshold && swipedElement.hasClass('panning')) {
      // Reset the position of the element
      swipedElement.css('transform', 'translateX(0)');
    }
  });





  $("#food-form").submit(function(event) {
    event.preventDefault();
    let food = $("#food-input").val().trim();  // Trim spaces
    if (food.length !== 0) {
      // Check if the food item already exists in the foods array
      if (foods.includes(food)) {
        alert("This food item already exists!");  // Inform the user
      } else {
        foods.push(food);
        const foodItem = $(`
          <li class="list-group-item food-option" data-food="${food}">
            ${food}
          </li>
        `);
        $("#food-list").append(foodItem);
        addSwipeHandler(foodItem[0]);
      }
      $("#food-input").val("");
    }
    updateGenerateLinkButtonState();
  });

  // Function to add food item to the list
  function addFoodItem(food) {
    if (foods.includes(food)) {
      alert("This food item already exists!"); // Inform the user
    } else {
      foods.push(food);
      const foodItem = $(`
        <li class="list-group-item food-option" data-food="${food}">
          ${food}
        </li>
      `);
      $("#food-list").append(foodItem);
      addSwipeHandler(foodItem[0]);
    }
    updateGenerateLinkButtonState();
  }

  // Create the suggestion button and append it to the DOM
  const suggestionButton = $(`<button class="btn btn-secondary suggestion-button"></button>`);
  $("#suggestion-buttons").append(suggestionButton);
  suggestionButton.click(function() {
    const food = $(this).text();
    addFoodItem(food);
    updateSuggestionButton(); // Update the suggestion button immediately after user clicks on one
  });

  // Function to update the suggestion button with a new value
  function updateSuggestionButton() {
    const randomFood = fastFoods[Math.floor(Math.random() * fastFoods.length)];
    suggestionButton.fadeOut(1000, function() {
      suggestionButton.text(randomFood);
      suggestionButton.fadeIn(1000);
    });
  }


  // Update the suggestion button immediately upon page load
  updateSuggestionButton();

  // Update the suggestion button with new values from the fastFoods array every 3 seconds
  setInterval(updateSuggestionButton, 6000);



  // Generate shareable link
  $("#generate-link").click(function(event) {
    event.preventDefault();
    const uniqueId = generateUniqueId();
    // Send food options to the server to save them under the unique ID
    axios.post("/saveOptions", { id: uniqueId, foods: foods })
      .then(function(response) {
        let link = `${window.location.origin}/vote.html?id=${uniqueId}`;
        navigator.clipboard.writeText(link);

        // Check if Web Share API is supported and if the device is mobile
        if (navigator.share && isMobileDevice()) {
          navigator.share({
            title: 'Vote on your next meal!',
            text: '',
            url: link,
          })
            .then(() => console.log('Successful share'))
            .catch((error) => {
              // If there's an error with the Web Share API, show the modal as a fallback
              $('#linkCopiedModal').modal('show');
            });
        } else {
          // For desktop or if Web Share API is not supported, show the modal
          $('#linkCopiedModal').modal('show');
        }

        // Redirect to the generated link after 3 seconds
        setTimeout(function() {
          window.location.href = link;
        }, 3000);
      })
      .catch(function(error) {
        console.log(error);
      });
  });

  function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
  }


  //create random URL suffix
  function generateUniqueId(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
});

const fastFoods = [
  "Pizza",
  "Burger",
  "Sushi",
  "Tacos",
  "Fried Chicken",
  "Ramen",
  "Pasta",
  "Steak",
  "BBQ Ribs",
  "Hot Dogs",
  "Ice Cream",
  "Donuts",
  "Sandwiches",
  "Pancakes",
  "Waffles",
  "French Fries",
  "Nachos",
  "Burritos",
  "Lobster",
  "Crab",
  "Shrimp",
  "Dim Sum",
  "Dumplings",
  "Spring Rolls",
  "Fried Rice",
  "Pad Thai",
  "Curry",
  "Shawarma",
  "Kebab",
  "Falafel",
  "Gyros",
  "Pho",
  "Banh Mi",
  "Kimchi",
  "Bibimbap",
  "Fried Fish",
  "Grilled Cheese",
  "Chicken Wings",
  "Caesar Salad",
  "Bruschetta",
  "Croissant",
  "Cheesecake",
  "Chocolate Cake",
  "Crepes",
  "Macarons",
  "Eclairs",
  "Poutine",
  "Chicken Tikka Masala",
  "Butter Chicken",
  "Samosas",
  "Naan",
  "Tandoori Chicken",
  "Biryani",
  "Empanadas",
  "Ceviche",
  "Guacamole",
  "Tamales",
  "Paella",
  "Gazpacho",
  "Churros",
  "Miso Soup",
  "Tempura",
  "Teriyaki",
  "Udon",
  "Sashimi",
  "Tofu",
  "Bento Box",
  "Gyoza",
  "Takoyaki",
  "Matcha",
  "Tiramisu",
  "Gelato",
  "Risotto",
  "Cannoli",
  "Ravioli",
  "Fettuccine Alfredo",
  "Calzone",
  "Lasagna",
  "Spaghetti Carbonara",
  "Gnocchi",
  "Oysters",
  "Clam Chowder",
  "Lobster Roll",
  "Crab Cakes",
  "Shrimp Po' Boy",
  "Scallops",
  "Calamari",
  "Fish Tacos",
  "Bagels",
  "Pretzels",
  "Apple Pie",
  "Brownies",
  "Chocolate Chip Cookies",
  "Cupcakes",
  "Muffins",
  "Scones",
  "Biscuits",
  "Beignets",
  "Cinnamon Rolls"
];
