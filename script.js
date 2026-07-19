function addProduct() {
    let name = document.getElementById("name").value;
    let cost = parseFloat(document.getElementById("cost").value);
    let sell = parseFloat(document.getElementById("sell").value);

    if (name === "" || isNaN(cost) || isNaN(sell)) {
        alert("Please fill all fields");
        return;
    }

    let profit = sell - cost;

    let table = document.getElementById("tableBody");
    let row = table.insertRow();

    row.insertCell(0).innerHTML = name;
    row.insertCell(1).innerHTML = "₹" + cost.toFixed(2);
    row.insertCell(2).innerHTML = "₹" + sell.toFixed(2);
    row.insertCell(3).innerHTML = "₹" + profit.toFixed(2);

    document.getElementById("name").value = "";
    document.getElementById("cost").value = "";
    document.getElementById("sell").value = "";
}
