function calculate(){

    // Get the values from the input field & parseFloat helps converts into a number.
    const capital = parseFloat(document.getElementById("capital").value);
    const years = parseFloat(document.getElementById("years").value);
    const interest = parseFloat(document.getElementById("interest").value);

    // Check if any of the inputs are empty or not valid numbers.
    if(isNaN(capital) || isNaN(years) || isNaN(interest)){
        document.getElementById("result").innerText = "Please enter all value !!!";
        return;
    }

    // Calculate the final amount.
    const amount = capital + (capital * years * interest) / 100;

    // Display the final calculated amount & toFixed(2) limits the result to 2 decimal places.
    document.getElementById("result").innerText = "Final Amount: ₹" + amount.toFixed(2);
}