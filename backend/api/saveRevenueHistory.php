<?php
// saveRevenueHistory.php

// Add CORS headers to allow cross-origin requests
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include your database connection file
require_once '../database.php'; // Adjust the path if needed

// Read JSON input from the request body
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data['revenue_date']) || !isset($data['total_revenue'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields: revenue_date and total_revenue."]);
    exit;
}

$revenue_date = $conn->real_escape_string($data['revenue_date']); // Expected format: 'YYYY-MM-DD'
$total_revenue = floatval($data['total_revenue']);

// Prepare the SQL query using a prepared statement
$stmt = $conn->prepare("INSERT INTO revenue_history (revenue_date, total_revenue) VALUES (?, ?)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Prepare failed: " . $conn->error]);
    exit;
}
$stmt->bind_param("sd", $revenue_date, $total_revenue);

if ($stmt->execute()) {
    echo json_encode([
        "message" => "Revenue history saved successfully",
        "id" => $stmt->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error saving revenue history: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
