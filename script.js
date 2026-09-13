const STORAGE_KEY = "fintrack_transactions";
const BUDGET_KEY = "fintrack_budget";
const THEME_KEY = "fintrack_theme";


let transactions =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

let budget =
    Number(localStorage.getItem(BUDGET_KEY)) || 0;


/* ELEMENTS */

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");

const pageHeading = document.getElementById("pageHeading");
const currentDate = document.getElementById("currentDate");

const modal = document.getElementById("modal");
const openModal = document.getElementById("openModal");
const openModal2 = document.getElementById("openModal2");

const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");

const transactionForm =
    document.getElementById("transactionForm");

const searchInput =
    document.getElementById("searchInput");

const typeFilter =
    document.getElementById("typeFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/* DATE */

currentDate.textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });


document.getElementById("date").value =
    new Date().toISOString().split("T")[0];


/* NAVIGATION */

function showPage(pageId) {

    pages.forEach(page => {
        page.classList.remove("active-page");
    });

    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }

    navItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageId
        );

    });

    const titles = {
        dashboard: "Dashboard",
        transactions: "Transactions",
        analytics: "Analytics",
        budget: "Budget Planner",
        settings: "Settings"
    };

    pageHeading.textContent =
        titles[pageId] || "Dashboard";

    document.querySelector(".sidebar")
        .classList.remove("open");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


navItems.forEach(item => {

    item.addEventListener("click", () => {

        showPage(item.dataset.page);

    });

});


document.querySelectorAll("[data-go]").forEach(button => {

    button.addEventListener("click", () => {

        showPage(button.dataset.go);

    });

});


/* MOBILE MENU */

document
    .getElementById("menuBtn")
    .addEventListener("click", () => {

        document
            .getElementById("sidebar")
            .classList.toggle("open");

    });


/* MODAL */

function openTransactionModal() {

    modal.classList.add("show");

    document.getElementById("description").focus();

}


function closeTransactionModal() {

    modal.classList.remove("show");

}


openModal.addEventListener(
    "click",
    openTransactionModal
);

openModal2.addEventListener(
    "click",
    openTransactionModal
);

closeModal.addEventListener(
    "click",
    closeTransactionModal
);

cancelModal.addEventListener(
    "click",
    closeTransactionModal
);


modal.addEventListener("click", event => {

    if (event.target === modal) {
        closeTransactionModal();
    }

});


/* ADD TRANSACTION */

transactionForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const description =
            document
                .getElementById("description")
                .value
                .trim();

        const amount =
            Number(
                document
                    .getElementById("amount")
                    .value
            );

        const type =
            document.getElementById("type").value;

        const category =
            document.getElementById("category").value;

        const date =
            document.getElementById("date").value;


        if (
            !description ||
            amount <= 0 ||
            !date
        ) {

            showToast(
                "Please enter valid transaction details."
            );

            return;

        }


        const transaction = {

            id: Date.now(),

            description,

            amount,

            type,

            category,

            date

        };


        transactions.unshift(transaction);

        saveData();

        transactionForm.reset();

        document.getElementById("date").value =
            new Date().toISOString().split("T")[0];

        closeTransactionModal();

        updateEverything();

        showToast(
            type === "income"
                ? "Income added successfully!"
                : "Expense added successfully!"
        );

    }
);


/* SAVE */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        BUDGET_KEY,
        budget
    );

}


/* CALCULATIONS */

function getIncome() {

    return transactions
        .filter(t => t.type === "income")
        .reduce(
            (sum, t) => sum + t.amount,
            0
        );

}


function getExpenses() {

    return transactions
        .filter(t => t.type === "expense")
        .reduce(
            (sum, t) => sum + t.amount,
            0
        );

}


function getBalance() {

    return getIncome() - getExpenses();

}


/* FORMAT MONEY */

function money(value) {

    return "₹" +
        Number(value).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


/* DASHBOARD */

function updateDashboard() {

    const income = getIncome();
    const expense = getExpenses();
    const balance = income - expense;


    document.getElementById(
        "dashboardBalance"
    ).textContent = money(balance);


    document.getElementById(
        "dashboardIncome"
    ).textContent = money(income);


    document.getElementById(
        "dashboardExpense"
    ).textContent = money(expense);


    document.getElementById(
        "transactionCount"
    ).textContent = transactions.length;


    renderRecentTransactions();

    renderBudgetOverview();

    renderCategoryOverview();

}


/* RECENT TRANSACTIONS */

function renderRecentTransactions() {

    const container =
        document.getElementById(
            "recentTransactions"
        );


    const recent =
        transactions.slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-receipt"></i>
                <h3>No transactions yet</h3>
                <p>Add a transaction to see it here.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        recent.map(transaction => {

            const icon =
                getCategoryIcon(
                    transaction.category
                );


            return `

                <div class="transaction-item">

                    <div class="transaction-icon-box">
                        <i class="${icon}"></i>
                    </div>

                    <div class="transaction-info">

                        <strong>
                            ${escapeHTML(
                                transaction.description
                            )}
                        </strong>

                        <span>
                            ${transaction.category}
                            •
                            ${formatDate(transaction.date)}
                        </span>

                    </div>

                    <div class="
                        transaction-amount
                        ${
                            transaction.type === "income"
                                ? "income-text"
                                : "expense-text"
                        }
                    ">

                        ${
                            transaction.type === "income"
                                ? "+"
                                : "-"
                        }

                        ${money(transaction.amount)}

                    </div>

                </div>

            `;

        }).join("");

}


/* TRANSACTION TABLE */

function renderTransactionTable() {

    const table =
        document.getElementById(
            "transactionTable"
        );

    const empty =
        document.getElementById(
            "emptyTable"
        );


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const type =
        typeFilter.value;


    const category =
        categoryFilter.value;


    const filtered =
        transactions.filter(transaction => {

            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(search) ||
                transaction.category
                    .toLowerCase()
                    .includes(search);


            const matchesType =
                type === "all" ||
                transaction.type === type;


            const matchesCategory =
                category === "all" ||
                transaction.category === category;


            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );

        });


    if (filtered.length === 0) {

        table.innerHTML = "";

        empty.style.display = "block";

        return;

    }


    empty.style.display = "none";


    table.innerHTML =
        filtered.map(transaction => {

            return `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                transaction.description
                            )}
                        </strong>
                    </td>

                    <td>
                        <span class="category-badge">
                            ${transaction.category}
                        </span>
                    </td>

                    <td>
                        ${formatDate(transaction.date)}
                    </td>

                    <td>

                        <span class="
                            type-badge
                            ${
                                transaction.type === "income"
                                    ? "type-income"
                                    : "type-expense"
                            }
                        ">

                            ${
                                transaction.type === "income"
                                    ? "Income"
                                    : "Expense"
                            }

                        </span>

                    </td>

                    <td class="
                        ${
                            transaction.type === "income"
                                ? "income-text"
                                : "expense-text"
                        }
                    ">

                        ${
                            transaction.type === "income"
                                ? "+"
                                : "-"
                        }

                        ${money(transaction.amount)}

                    </td>

                    <td>

                        <button
                            class="delete-small"
                            onclick="deleteTransaction(${transaction.id})"
                            title="Delete transaction"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}


searchInput.addEventListener(
    "input",
    renderTransactionTable
);

typeFilter.addEventListener(
    "change",
    renderTransactionTable
);

categoryFilter.addEventListener(
    "change",
    renderTransactionTable
);


/* DELETE */

function deleteTransaction(id) {

    const transaction =
        transactions.find(
            t => t.id === id
        );


    if (!transaction) return;


    const confirmed =
        confirm(
            `Delete "${transaction.description}"?`
        );


    if (!confirmed) return;


    transactions =
        transactions.filter(
            t => t.id !== id
        );


    saveData();

    updateEverything();

    showToast(
        "Transaction deleted."
    );

}


/* CATEGORY */

const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Education",
    "Health",
    "Other"
];


function renderCategoryOverview() {

    const container =
        document.getElementById(
            "categoryOverview"
        );


    const expenses =
        getExpenses();


    if (expenses === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <p>No expense data available yet.</p>
            </div>
        `;

        return;

    }


    const categoryData =
        categories.map(category => {

            const amount =
                transactions
                    .filter(
                        t =>
                            t.type === "expense" &&
                            t.category === category
                    )
                    .reduce(
                        (sum, t) =>
                            sum + t.amount,
                        0
                    );


            return {
                category,
                amount
            };

        }).filter(item => item.amount > 0);


    container.innerHTML =
        categoryData.map(item => {

            const percentage =
                (item.amount / expenses) * 100;


            return `

                <div class="category-card">

                    <div>

                        <strong>
                            ${item.category}
                        </strong>

                        <span>
                            ${percentage.toFixed(0)}%
                        </span>

                    </div>

                    <div class="category-progress">

                        <div
                            style="width:${percentage}%"
                        ></div>

                    </div>

                </div>

            `;

        }).join("");

}


/* ANALYTICS */

function updateAnalytics() {

    const income = getIncome();
    const expense = getExpenses();
    const savings = income - expense;


    document.getElementById(
        "analyticsIncome"
    ).textContent = money(income);


    document.getElementById(
        "analyticsExpense"
    ).textContent = money(expense);


    document.getElementById(
        "analyticsSavings"
    ).textContent = money(savings);


    const rate =
        income > 0
            ? (savings / income) * 100
            : 0;


    document.getElementById(
        "savingsRate"
    ).textContent =
        `${Math.max(0, rate).toFixed(1)}%`;


    renderAnalyticsCategories();

    renderMonthlyChart();

}


function renderAnalyticsCategories() {

    const container =
        document.getElementById(
            "analyticsCategories"
        );


    const expense =
        getExpenses();


    if (expense === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <p>Add expenses to view your analytics.</p>
            </div>
        `;

        return;

    }


    const data =
        categories.map(category => {

            const amount =
                transactions
                    .filter(
                        t =>
                            t.type === "expense" &&
                            t.category === category
                    )
                    .reduce(
                        (sum, t) =>
                            sum + t.amount,
                        0
                    );


            return {
                category,
                amount
            };

        }).filter(item => item.amount > 0);


    container.innerHTML =
        data.map(item => {

            const percentage =
                (item.amount / expense) * 100;


            return `

                <div>

                    <div class="bar-info">

                        <span>
                            ${item.category}
                        </span>

                        <span>
                            ${money(item.amount)}
                            (${percentage.toFixed(1)}%)
                        </span>

                    </div>

                    <div class="bar-track">

                        <div
                            class="bar-fill"
                            style="width:${percentage}%"
                        ></div>

                    </div>

                </div>

            `;

        }).join("");

}


/* MONTHLY CHART */

function renderMonthlyChart() {

    const container =
        document.getElementById(
            "monthlyChart"
        );


    const months = [];


    for (let i = 5; i >= 0; i--) {

        const date = new Date();

        date.setMonth(
            date.getMonth() - i
        );


        months.push({
            month: date.getMonth(),
            year: date.getFullYear(),
            name: date.toLocaleDateString(
                "en-IN",
                {
                    month: "short"
                }
            )
        });

    }


    const monthlyData =
        months.map(item => {

            const monthTransactions =
                transactions.filter(t => {

                    const date =
                        new Date(
                            t.date + "T00:00:00"
                        );

                    return (
                        date.getMonth() === item.month &&
                        date.getFullYear() === item.year
                    );

                });


            const income =
                monthTransactions
                    .filter(
                        t => t.type === "income"
                    )
                    .reduce(
                        (sum, t) =>
                            sum + t.amount,
                        0
                    );


            const expense =
                monthTransactions
                    .filter(
                        t => t.type === "expense"
                    )
                    .reduce(
                        (sum, t) =>
                            sum + t.amount,
                        0
                    );


            return {
                ...item,
                income,
                expense
            };

        });


    const maxValue =
        Math.max(
            ...monthlyData.flatMap(
                item => [
                    item.income,
                    item.expense
                ]
            ),
            100
        );


    container.innerHTML =
        monthlyData.map(item => {

            const incomeHeight =
                Math.max(
                    3,
                    (item.income / maxValue) * 180
                );


            const expenseHeight =
                Math.max(
                    3,
                    (item.expense / maxValue) * 180
                );


            return `

                <div
                    class="month-column"
                    title="
                        ${item.name}:
                        Income ${money(item.income)},
                        Expenses ${money(item.expense)}
                    "
                >

                    <div
                        class="month-bar"
                        style="height:${incomeHeight}px"
                    ></div>

                    <div
                        class="month-bar expense-bar"
                        style="height:${expenseHeight}px"
                    ></div>

                    <span class="month-label">
                        ${item.name}
                    </span>

                </div>

            `;

        }).join("");

}


/* BUDGET */

function updateBudget() {

    const spent =
        getExpenses();


    const percentage =
        budget > 0
            ? (spent / budget) * 100
            : 0;


    const safePercentage =
        Math.min(100, Math.max(0, percentage));


    const remaining =
        budget - spent;


    document.getElementById(
        "budgetPercentage"
    ).textContent =
        budget > 0
            ? `${Math.round(percentage)}%`
            : "0%";


    document.getElementById(
        "budgetSpent"
    ).textContent =
        money(spent);


    document.getElementById(
        "budgetTotal"
    ).textContent =
        money(budget);


    document.getElementById(
        "budgetRemaining"
    ).textContent =
        money(Math.max(0, remaining));


    document.getElementById(
        "bigBudgetPercentage"
    ).textContent =
        budget > 0
            ? `${Math.round(percentage)}%`
            : "0%";


    document.getElementById(
        "bigBudgetSpent"
    ).textContent =
        `${money(spent)} spent`;


    document.getElementById(
        "bigBudgetRemaining"
    ).textContent =
        `${money(Math.max(0, remaining))} remaining`;


    document.getElementById(
        "bigProgressFill"
    ).style.width =
        `${safePercentage}%`;


    document.querySelector(
        ".budget-circle"
    ).style.setProperty(
        "--budget-progress",
        `${safePercentage * 3.6}deg`
    );


    document.getElementById(
        "budgetInput"
    ).value =
        budget || "";

}


document
    .getElementById("saveBudget")
    .addEventListener(
        "click",
        () => {

            const value =
                Number(
                    document.getElementById(
                        "budgetInput"
                    ).value
                );


            if (value < 0) {

                showToast(
                    "Enter a valid budget."
                );

                return;

            }


            budget = value;

            saveData();

            updateBudget();

            showToast(
                "Budget saved successfully!"
            );

        }
    );


function renderBudgetOverview() {

    updateBudget();

}


/* SETTINGS - DARK MODE */

const themeBtn =
    document.getElementById(
        "themeBtn"
    );

const darkToggle =
    document.getElementById(
        "darkModeToggle"
    );


function setDarkMode(enabled) {

    document.body.classList.toggle(
        "dark",
        enabled
    );


    darkToggle.checked = enabled;


    themeBtn.innerHTML =
        enabled
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';


    localStorage.setItem(
        THEME_KEY,
        enabled
            ? "dark"
            : "light"
    );

}


const savedTheme =
    localStorage.getItem(THEME_KEY);


setDarkMode(
    savedTheme === "dark"
);


themeBtn.addEventListener(
    "click",
    () => {

        setDarkMode(
            !document.body.classList.contains(
                "dark"
            )
        );

    }
);


darkToggle.addEventListener(
    "change",
    () => {

        setDarkMode(
            darkToggle.checked
        );

    }
);


/* EXPORT CSV */

document
    .getElementById("exportData")
    .addEventListener(
        "click",
        () => {

            if (transactions.length === 0) {

                showToast(
                    "No transactions to export."
                );

                return;

            }


            const header =
                "Description,Amount,Type,Category,Date\n";


            const rows =
                transactions.map(t => {

                    return [
                        `"${t.description.replaceAll(
                            '"',
                            '""'
                        )}"`,
                        t.amount,
                        t.type,
                        t.category,
                        t.date
                    ].join(",");

                }).join("\n");


            const blob =
                new Blob(
                    [header + rows],
                    {
                        type: "text/csv"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;

            link.download =
                "fintrack-transactions.csv";


            link.click();


            URL.revokeObjectURL(url);


            showToast(
                "Transactions exported!"
            );

        }
    );


/* CLEAR DATA */

document
    .getElementById("clearData")
    .addEventListener(
        "click",
        () => {

            if (transactions.length === 0) {

                showToast(
                    "There is no data to clear."
                );

                return;

            }


            const confirmed =
                confirm(
                    "Are you sure you want to delete all transactions and budget data?"
                );


            if (!confirmed) return;


            transactions = [];

            budget = 0;

            saveData();

            updateEverything();

            showToast(
                "All data has been cleared."
            );

        }
    );


/* UTILITIES */

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function getCategoryIcon(category) {

    const icons = {

        Food:
            "fa-solid fa-utensils",

        Transport:
            "fa-solid fa-car",

        Shopping:
            "fa-solid fa-bag-shopping",

        Bills:
            "fa-solid fa-file-invoice",

        Entertainment:
            "fa-solid fa-film",

        Education:
            "fa-solid fa-graduation-cap",

        Health:
            "fa-solid fa-heart-pulse",

        Other:
            "fa-solid fa-wallet"

    };


    return (
        icons[category] ||
        icons.Other
    );

}


function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent = value;


    return div.innerHTML;

}


/* TOAST */

let toastTimer;


function showToast(message) {

    toastMessage.textContent =
        message;


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* UPDATE EVERYTHING */

function updateEverything() {

    updateDashboard();

    renderTransactionTable();

    updateAnalytics();

    updateBudget();

}


/* START APP */

updateEverything();
