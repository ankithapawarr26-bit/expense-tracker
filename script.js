const transactionForm = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const transactionList = document.getElementById("transactionList");
const emptyMessage = document.getElementById("emptyMessage");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveTransactions() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

function updateSummary() {

    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {

        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expense += transaction.amount;
        }

    });

    const balance = income - expense;

    incomeElement.textContent = `₹${income.toFixed(2)}`;
    expenseElement.textContent = `₹${expense.toFixed(2)}`;
    balanceElement.textContent = `₹${balance.toFixed(2)}`;
}

function displayTransactions() {

    transactionList.innerHTML = "";

    if (transactions.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    transactions.forEach(transaction => {

        const li = document.createElement("li");

        li.className = `transaction ${transaction.type}`;

        const sign = transaction.type === "income" ? "+" : "-";

        li.innerHTML = `
            <div class="transaction-info">
                <h4>${escapeHTML(transaction.description)}</h4>
                <small>${transaction.type.toUpperCase()}</small>
            </div>

            <div class="transaction-amount">
                ${sign} ₹${transaction.amount.toFixed(2)}
            </div>

            <button
                class="delete-btn"
                onclick="deleteTransaction(${transaction.id})"
            >
                Delete
            </button>
        `;

        transactionList.appendChild(li);
    });
}

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

transactionForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;

    if (!description || amount <= 0) {
        alert("Please enter valid transaction details.");
        return;
    }

    const transaction = {
        id: Date.now(),
        description: description,
        amount: amount,
        type: type
    };

    transactions.unshift(transaction);

    saveTransactions();

    displayTransactions();
    updateSummary();

    transactionForm.reset();

});

function deleteTransaction(id) {

    transactions = transactions.filter(
        transaction => transaction.id !== id
    );

    saveTransactions();

    displayTransactions();
    updateSummary();
}

displayTransactions();
updateSummary();
