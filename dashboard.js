document.addEventListener('DOMContentLoaded', function() {
    // Sample inventory data (replace with actual database data)
    const inventoryData = [
        { id: 1, name: 'Laptop', category: 'Electronics', quantity: 5, price: 999.99 },
        { id: 2, name: 'Desk Chair', category: 'Furniture', quantity: 2, price: 199.99 },
        { id: 3, name: 'Printer', category: 'Electronics', quantity: 8, price: 299.99 },
        { id: 4, name: 'Filing Cabinet', category: 'Furniture', quantity: 3, price: 149.99 },
        { id: 5, name: 'Monitor', category: 'Electronics', quantity: 4, price: 249.99 }
    ];

    // Update overview statistics
    updateOverview(inventoryData);

    // Update stock status table
    updateStockStatus(inventoryData);
});

function updateOverview(data) {
    const totalItems = data.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = data.filter(item => item.quantity <= 5).length;
    const totalValue = data.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('lowStockItems').textContent = lowStockItems;
    document.getElementById('totalValue').textContent = `$${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
}

function updateStockStatus(data) {
    const stockTable = document.getElementById('stockTable');
    stockTable.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-700';
        
        const status = getStockStatus(item.quantity);
        
        row.innerHTML = `
            <td class="py-3 px-4">${item.name}</td>
            <td class="py-3 px-4">${item.category}</td>
            <td class="py-3 px-4">${item.quantity}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs ${status.class}">
                    ${status.text}
                </span>
            </td>
        `;
        
        stockTable.appendChild(row);
    });
}

function getStockStatus(quantity) {
    if (quantity <= 2) {
        return { text: 'Critical', class: 'bg-red-900 text-red-300' };
    } else if (quantity <= 5) {
        return { text: 'Low', class: 'bg-yellow-900 text-yellow-300' };
    } else {
        return { text: 'Good', class: 'bg-green-900 text-green-300' };
    }
}