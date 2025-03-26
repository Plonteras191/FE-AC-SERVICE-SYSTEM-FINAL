<?php
// booking.php

// Set headers for JSON response and enable CORS
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include the database connection file
require_once '../database.php';

// Only allow POST requests for booking submission
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["message" => "Invalid request method."]);
    exit;
}

// Read the incoming JSON data from the request body
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields: name, phone, and completeAddress must be present
if (!isset($data['name'], $data['phone'], $data['completeAddress'])) {
    echo json_encode(["message" => "Missing required fields."]);
    exit;
}

// Sanitize and assign input data
$name = $conn->real_escape_string($data['name']);
$phone = $conn->real_escape_string($data['phone']);
$email = isset($data['email']) ? $conn->real_escape_string($data['email']) : "";
$completeAddress = $conn->real_escape_string($data['completeAddress']);
$street = isset($data['street']) ? $conn->real_escape_string($data['street']) : "";
$houseNo = isset($data['houseNo']) ? $conn->real_escape_string($data['houseNo']) : "";
$apartmentNo = isset($data['apartmentNo']) ? $conn->real_escape_string($data['apartmentNo']) : "";
$selectedMainDate = isset($data['selectedMainDate']) ? $conn->real_escape_string($data['selectedMainDate']) : null;

// Encode services and acTypes arrays as JSON strings for storage
$services = isset($data['services']) ? $conn->real_escape_string(json_encode($data['services'])) : "";
$acTypes = isset($data['acTypes']) ? $conn->real_escape_string(json_encode($data['acTypes'])) : "";

// Prepare the SQL insert query to save the booking
$sql = "INSERT INTO bookings (name, phone, email, complete_address, street, house_no, apartment_no, services, ac_types)
        VALUES ('$name', '$phone', '$email', '$completeAddress', '$street', '$houseNo', '$apartmentNo', '$services', '$acTypes')";


// Execute the query and check for success
if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Booking saved successfully", "bookingId" => $conn->insert_id]);
} else {
    echo json_encode(["message" => "Error saving booking", "error" => $conn->error]);
}

$conn->close();
?>
