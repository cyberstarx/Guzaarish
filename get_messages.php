<?php
// Include database configuration
require_once 'config.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Get parameters from request
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$category = isset($_GET['category']) ? $_GET['category'] : 'all';
$search = isset($_GET['search']) ? $_GET['search'] : '';

// Validate page number
if ($page < 1) {
    $page = 1;
}

// Items per page
$itemsPerPage = 9;
$offset = ($page - 1) * $itemsPerPage;

// Build query based on filters
$whereClause = [];
$params = [];
$types = '';

if ($category != 'all') {
    $whereClause[] = "category = ?";
    $params[] = $category;
    $types .= 's';
}

if (!empty($search)) {
    $whereClause[] = "(recipient_name LIKE ? OR message_text LIKE ?)";
    $searchTerm = "%$search%";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $types .= 'ss';
}

// Combine where clauses
$whereSQL = '';
if (!empty($whereClause)) {
    $whereSQL = "WHERE " . implode(" AND ", $whereClause);
}

// Count total matching records for pagination
$countQuery = "SELECT COUNT(*) AS total FROM messages $whereSQL";
$stmt = $conn->prepare($countQuery);

if (!empty($types)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$totalItems = $row['total'];
$totalPages = ceil($totalItems / $itemsPerPage);

// Get messages with pagination
$query = "SELECT id, message_text, recipient_name, category, submission_date 
          FROM messages 
          $whereSQL 
          ORDER BY submission_date DESC 
          LIMIT ? OFFSET ?";

$stmt = $conn->prepare($query);

// Add pagination parameters
$types .= 'ii';
$params[] = $itemsPerPage;
$params[] = $offset;

$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

// Fetch all messages
$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}

// Return JSON response
echo json_encode([
    'success' => true,
    'messages' => $messages,
    'currentPage' => $page,
    'totalPages' => $totalPages,
    'totalItems' => $totalItems
]);

// Close connection
$stmt->close();
$conn->close();
?>