<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database connection
require_once "../database.php";

// Process only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

// Get JSON data from the request
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit();
}

// Sanitize inputs
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$password = $data['password'];

// Hard-coded admin accounts (in a real app, you would store these securely in the database)
$validAdmins = [
    [
        'id' => 1,
        'email' => 'eeradmin@gmail.com',
        'password' => 'admineer2025',
        'name' => 'Admin EER'
    ],
    [
        'id' => 2,
        'email' => 'eeradmin2@gmail.com',
        'password' => 'admineer2025',
        'name' => 'Admin EER 2'
    ]
];

// Check if credentials match any valid admin
$authenticated = false;
$adminInfo = null;

foreach ($validAdmins as $admin) {
    if ($admin['email'] === $email && $admin['password'] === $password) {
        $authenticated = true;
        $adminInfo = [
            'id' => $admin['id'],
            'email' => $admin['email'],
            'name' => $admin['name']
        ];
        break;
    }
}

if ($authenticated) {
    // Generate a simple token (in production, use a proper JWT library)
    $token = bin2hex(random_bytes(32));
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'admin' => $adminInfo
    ]);
} else {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email or password'
    ]);
}
?>