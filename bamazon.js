// DEPENDENCY PACKAGES
// ==========================================================================
// This holds the inquirer package
var inquirer = require("inquirer");

// This holds the mysql package
var mysql = require("mysql");

// This method prints the data as a table to the console
require("console.table");

// This variable initializes a connection with the MySQL database
var connection = mysql.createConnection({
  // Connection name
  host: "localhost",
  // Port #
  port: "3306",
  // Username
  user: "root",
  // Password
  password: "password",
  // Database name
  database: "bamazon",
});


// FUNCTIONS
// ==========================================================================
// FUNCTION #1
// This creates a connection with the server and loads the products from the database
connection.connect(function(err) {
  // A if statement if the connection is unsuccessful
  if (err) {
    console.error("Error Connection: " + err.stack);
  }
  // Calling the loadProducts() function
  loadProducts();
});

// FUNCTION #2
// This loads all the products from the bamazon database to the console
function loadProducts() {
  // Selecting all of the data
  connection.query("SELECT * FROM products", function (err, res) {
    // If unable to connect to the server, throw an error
    if (err) throw err;
    // This displays a table in the terminal
    console.table(res);
    // Calling the promptCustomerForItem() function
    promptCustomerForItem(res);
  });
}

// FUNCTION #3
// This prompts the customer for a product ID
function promptCustomerForItem(inventory) {
  // Prompts the user for what they want to purchase
  inquirer
    .prompt([
      {
        type: "input",
        name: "choice",
        message: "What is the ID # of the item you like to purchase?    [Press 'q' to exit]",
        // This function determines if the key pressed is illegal
        validate: function (val) {
          return !isNaN(val) || val.toLowerCase() === "q";
        },
      },
    ])
    // A then() method to return a promise
    .then(function(val) {
        // Calling the userQuit() function if the user wants to quit
        userQuit(val.choice);
        // This variable stores the ID # as an integer
        var choiceId = parseInt(val.choice);
        var product = checkInventory(choiceId, inventory);
        // If there is a product with the ID the user chose, prompt the customer for a desired quantity
        if (product) {
            // Calling the promptCustomerForQuantity() function
            promptCustomerForQuantity(product);
        } 
        // Else log a "out of stock" message to the console
        else {
            console.log("\nSorry! Out of stock...");
            console.log("-----------------------------------------------------------------------------------------------")
            // Calling the loadProducts() function
            loadProducts();
        }
    });
}

// FUNCTION #4
// This prompts the customer for the quantity of products to buy
function promptCustomerForQuantity(product) {
    inquirer
    // Prompts the user for the number of products wanted
    .prompt([
        {
            type: "input",
            name: "quantity",
            message: "How many would you like? [Press 'q' to exit]",
            // This function determines if the key pressed is illegal
            validate: function(val) {
                return val > 0 || val.toLowerCase() === "q";
            }
        }
    ])
    // A then() method to return a promise
    .then(function(val) {
        // Calling the userQuit() function
        userQuit(val.quantity);
        // This variable stores the quantity as an integer
        var quantity = parseInt(val.quantity);
        // if the quantity the user entered is bigger than the quantity in the database
        if (quantity > product.stock_quantity) {
            // Logging a "out of stock" message to the terminal
            console.log("\nSorry! Out of stock...");
            console.log("-----------------------------------------------------------------------------------------------")
            // Calling the loadProducts() function
            loadProducts();
        }
        // Else let the customer make the purchase
        else {
            // Calling the makePurchase() function
            makePurchase(product, quantity);
        }
    });
}

// FUNCTION #5
// This allows the user to purchase and choice the number of products wanted
function makePurchase(product, quantity) {
    // This performs a query to the database
    connection.query(
        // Updates the bamazon database after the number of purchases
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
        // Referencing the quanitity number and product ID
        [quantity, product.item_id],
        // This function either sends a error or successful message
        function(err, res) {
            // Logging a successul purchase message to the terminal
            console.log("\nPurchase Successful! You purchased " + quantity + " " + product.product_name + "'s!");
            console.log("-----------------------------------------------------------------------------------------------")
            // Calling the loadProducts() function to load the new amount of quantity left
            loadProducts();
        }
    );
}

// FUNCTION #6
// This function checks if the product the user chose exists in the database
function checkInventory(choiceId, inventory) {
    // A for loop that loops through the entire database
    for (var i = 0; i < inventory.length; i++) {
        // If there is a match...
        if (inventory[i].item_id === choiceId) {
            // This returns the number of products 
            return inventory[i];
        }
    }
    // Otherwise return null
    return null;
}

// FUNCTION #7
// This function checks if the user wants to quit the program
function userQuit(choice) {
    // If the user clicks on "q"...
    if (choice.toLowerCase() === "q") {
        // Logging a goodbye message to the terminal
        console.log("Thank you for shopping! Goodbye!");
        // Using the exit() method to terminate the node.js program
        process.exit(0);
    }
}