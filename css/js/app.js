// State management
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let budgetLimit = parseFloat(localStorage.getItem('budgetLimit')) || 0;
let currentTheme = localStorage.getItem('theme') || 'light';
let expenseChart = null;

// DOM Elements
const transactionForm = document.getElementById('transaction-form');
const itemNameInput = document.getElementById('item-name');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const transactionList = document.getElementById('transaction-list');
const totalBalanceDisplay = document.getElementById('total-balance');
const themeToggle = document.getElementById('theme-toggle');
const budgetLimitInput = document.getElementById('budget-limit');
const limitWarning = document.getElementById('limit-warning');
const sortOptions = document.getElementById('sort-options');

function init() {
    // Muat tema & limit awal
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️ Mode Terang' : '🌙 Mode Gelap';
    budgetLimitInput.value = budgetLimit > 0 ? budgetLimit : '';

    render();
}

function render() {
    renderTransactions();
    calculateBalance();
    renderChart();
}

// 1. Render & Urutkan Transaksi (Fitur Tantangan Menyortir)
function renderTransactions() {
    transactionList.innerHTML = '';
    let displayData = [...transactions];
    const sortVal = sortOptions.value;

    if (sortVal === 'amount-high') {
        displayData.sort((a, b) => b.amount - a.amount);
    } else if (sortVal === 'amount-low') {
        displayData.sort((a, b) => a.amount - b.amount);
    } else if (sortVal === 'category') {
        displayData.sort((a, b) => a.category.localeCompare(b.category));
    } else {
        displayData.reverse(); // Terbaru di atas
    }

    if (displayData.length === 0) {
        transactionList.innerHTML = '<li style="color: var(--text-muted); padding: 10px 0;">Belum ada pengeluaran.</li>';
        return;
    }

    displayData.forEach(item => {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-amt">$${item.amount.toFixed(2)}</div>
                <span class="badge">${item.category}</span>
            </div>
            <button class="btn-delete" onclick="deleteTransaction(${item.id})">Delete</button>
        `;
        transactionList.appendChild(li);
    });
}

// 2. Hitung Total Balance & Warning Limit Anggaran
function calculateBalance() {
    const total = transactions.reduce((sum, item) => sum + item.amount, 0);
    totalBalanceDisplay.textContent = `$${total.toFixed(2)}`;

    if (budgetLimit > 0 && total > budgetLimit) {
        limitWarning.classList.remove('hidden');
    } else {
        limitWarning.classList.add('hidden');
    }
}

// 3. Render Pie Chart (Chart.js)
function renderChart() {
    const dataCat = { Food: 0, Transport: 0, Fun: 0 };
    transactions.forEach(item => {
        if (dataCat[item.category] !== undefined) {
            dataCat[item.category] += item.amount;
        }
    });

    const ctx = document.getElementById('expense-chart').getContext('2d');

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Food', 'Transport', 'Fun'],
            datasets: [{
                data: [dataCat.Food, dataCat.Transport, dataCat.Fun],
                backgroundColor: ['#2ecc71', '#3498db', '#e67e22'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: currentTheme === 'dark' ? '#f5f5f5' : '#333333'
                    }
                }
            }
        }
    });
}

// Event Listeners
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = itemNameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;

    if (!name || isNaN(amount) || !category) return;

    const newTx = { id: Date.now(), name, amount, category };
    transactions.push(newTx);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    transactionForm.reset();
    render();
});

window.deleteTransaction = function(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    render();
};

sortOptions.addEventListener('change', renderTransactions);

budgetLimitInput.addEventListener('input', (e) => {
    budgetLimit = parseFloat(e.target.value) || 0;
    localStorage.setItem('budgetLimit', budgetLimit);
    calculateBalance();
});

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️ Mode Terang' : '🌙 Mode Gelap';
    renderChart();
});

init();