<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Function to check if admin is authenticated
function isAdminAuthenticated() {
    // Get all headers
    $headers = getallheaders();
    
    // Check if authorization header exists
    if (!isset($headers['Authorization']) && !isset($headers['authorization'])) {
        return false;
    }
    
    // Get the token from the header
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : $headers['authorization'];
    $token = str_replace('Bearer ', '', $authHeader);
    
    // In a real application, you would validate the token against a database or JWT
    // For this example, we're just checking if a token exists
    return !empty($token);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isAdminAuthenticated()) {
        echo json_encode(['authenticated' => true]);
    } else {
        echo json_encode(['authenticated' => false]);
    }
}
?>