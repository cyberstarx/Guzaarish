        // Global variables
        let currentPage = 1;
        let totalPages = 1;
        let currentCategory = 'all';
        let currentSearch = '';

        // DOM elements
        const messagesContainer = document.getElementById('messages-container');
        const paginationContainer = document.getElementById('pagination');
        const messageForm = document.getElementById('message-form');
        const statusMessage = document.getElementById('status-message');
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        const filterButtons = document.querySelectorAll('.filter-button');
        
        // Load messages when the page loads
        document.addEventListener('DOMContentLoaded', function() {
            loadMessages();
            
            // Set up event listeners
            messageForm.addEventListener('submit', submitMessage);
            searchButton.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
            
            // Set up filter buttons
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    currentCategory = this.dataset.category;
                    currentPage = 1;
                    loadMessages();
                });
            });
        });
        
        // Function to load messages from the server
        function loadMessages() {
            messagesContainer.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>Loading messages...</p>
                </div>
            `;
            
            // Build the API URL with parameters
            // Build the API URL with parameters
let url = '/get_messages.php?page=' + currentPage;
if (currentCategory !== 'all') {
    url += '&category=' + encodeURIComponent(currentCategory);
}
if (currentSearch) {
    url += '&search=' + encodeURIComponent(currentSearch);
}
            
            // Use the constructed URL instead of the hardcoded one
            fetch('get_messages.php?page=')
                .then(response => response.json())
                .then(data => {
                    console.log('Response data:', data);
                    if (data.success) {
                        displayMessages(data.messages);
                        updatePagination(data.totalPages);
                        totalPages = data.totalPages;
                    } else {
                        displayError(data.message || 'Error loading messages');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    displayError('Network error occurred. Please try again later.');
                });
        }
        
        // Function to display messages in the container
        function displayMessages(messages) {
            if (!messages || messages.length === 0) {
                messagesContainer.innerHTML = `
                    <div class="no-results">
                        <p>No messages found${currentSearch ? ` for "${currentSearch}"` : ''}.</p>
                    </div>
                `;
                return;
            }
            
            messagesContainer.innerHTML = '';
            
            messages.forEach(message => {
                const messageCard = document.createElement('div');
                messageCard.className = 'message-card';
                
                // Format date
                const date = new Date(message.submission_date);
                const formattedDate = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short'
                });
                
                // Determine category class
                const categoryClass = 'category-' + message.category.toLowerCase();
                
                // Create HTML for message
                messageCard.innerHTML = `
                    <div class="recipient-name">To: ${highlightText(message.recipient_name, currentSearch)}</div>
                    <p class="message-text">${highlightText(message.message_text, currentSearch)}</p>
                    <div class="message-meta">
                        <span class="category ${categoryClass}">${getCategoryLabel(message.category)}</span>
                        <span class="date">${formattedDate}</span>
                    </div>
                `;
                
                messagesContainer.appendChild(messageCard);
            });
        }
        
        // Function to highlight search terms
        function highlightText(text, searchTerm) {
            if (!searchTerm) return text;
            
            const regex = new RegExp('(' + searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
            return text.replace(regex, '<span class="highlighted">$1</span>');
        }
        
        // Function to get readable category label
        function getCategoryLabel(category) {
            const labels = {
                'ex': 'Ex',
                'friend': 'Friend',
                'family': 'Family',
                'crush': 'Crush',
                'self': 'To Self',
                'other': 'Other'
            };
            return labels[category] || category;
        }
        
        // Function to update pagination controls
        function updatePagination(totalPages) {
            paginationContainer.innerHTML = '';
            
            if (totalPages <= 1) {
                return;
            }
            
            // Previous button
            const prevButton = document.createElement('button');
            prevButton.className = 'pagination-button';
            prevButton.innerHTML = '&laquo; Prev';
            prevButton.disabled = currentPage === 1;
            prevButton.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    loadMessages();
                }
            });
            paginationContainer.appendChild(prevButton);
            
            // Page numbers (show max 5 pages)
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, startPage + 4);
            
            for (let i = startPage; i <= endPage; i++) {
                const pageButton = document.createElement('button');
                pageButton.className = 'pagination-button';
                if (i === currentPage) {
                    pageButton.classList.add('active');
                }
                pageButton.textContent = i;
                pageButton.addEventListener('click', function() {
                    currentPage = i;
                    loadMessages();
                });
                paginationContainer.appendChild(pageButton);
            }
            
            // Next button
            const nextButton = document.createElement('button');
            nextButton.className = 'pagination-button';
            nextButton.innerHTML = 'Next &raquo;';
            nextButton.disabled = currentPage === totalPages;
            nextButton.addEventListener('click', function() {
                if (currentPage < totalPages) {
                    currentPage++;
                    loadMessages();
                }
            });
            paginationContainer.appendChild(nextButton);
        }
        
        // Function to submit a new message
        function submitMessage(e) {
            e.preventDefault();
            
            const messageText = document.getElementById('message-text').value;
            const recipientName = document.getElementById('recipient-name').value;
            const category = document.getElementById('category').value;
            
            if (!messageText || !recipientName || !category) {
                showStatus('Please fill in all fields', 'error');
                return;
            }
            
            // Create form data
            const formData = new FormData();
            formData.append('messageText', messageText);
            formData.append('recipientName', recipientName);
            formData.append('category', category);
            
            // Disable form while submitting
            const submitButton = messageForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            
            // Send to server with correct path
            fetch('submit_messages.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showStatus(data.message || 'Your message has been submitted anonymously', 'success');
                    messageForm.reset();
                    // Reload messages to show the new message
                    loadMessages();
                } else {
                    showStatus(data.message || 'Error submitting message', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showStatus('Network error occurred. Please try again later.', 'error');
            })
            .finally(() => {
                // Re-enable form
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Anonymously';
            });
        }
        
        // Function to perform search
        function performSearch() {
            const searchTerm = searchInput.value.trim();
            currentSearch = searchTerm;
            currentPage = 1;
            loadMessages();
        }
        
       // Function to show status messages
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
    statusMessage.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 5000); // Missing closing parenthesis and time parameter
} // Missing closing brace
        
        // Function to display error messages
        function displayError(message) {
            messagesContainer.innerHTML = `
                <div class="error status-message">
                    <p>${message}</p>
                </div>
            `;
        }
            