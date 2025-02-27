<?php
// Include database configuration
require_once 'config.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get and sanitize form data
$messageText = filter_input(INPUT_POST, 'messageText', FILTER_SANITIZE_SPECIAL_CHARS);
$recipientName = filter_input(INPUT_POST, 'recipientName', FILTER_SANITIZE_SPECIAL_CHARS);
$category = filter_input(INPUT_POST, 'category', FILTER_SANITIZE_SPECIAL_CHARS);

// Validate data
if (empty($messageText) || empty($recipientName) || empty($category)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// Validate category
$validCategories = ['ex', 'friend', 'family', 'crush', 'self', 'other'];
if (!in_array($category, $validCategories)) {
    echo json_encode(['success' => false, 'message' => 'Invalid category']);
    exit;
}

// Prepare SQL statement to prevent SQL injection
$stmt = $conn->prepare("INSERT INTO messages (message_text, recipient_name, category) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $messageText, $recipientName, $category);

// Execute the statement
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Your message has been submitted anonymously']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error saving message to database']);
}

// Close connection
$stmt->close();
$conn->close();
?>
