<?php
// updateAvailability.php

header("Content-Type: application/json");
require_once '../database.php';

// This endpoint expects a POST request with a JSON payload containing:
// { "date": "2025-04-05", "is_available": 0 }
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (isset($input['date']) && isset($input['is_available'])) {
        $date = $conn->real_escape_string($input['date']);
        $is_available = (int)$input['is_available'];
        
        // Update the availability for the specified date
        $sql = "UPDATE available_dates SET is_available = $is_available WHERE date = '$date'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Date updated successfully"]);
        } else {
            echo json_encode(["message" => "Error updating date", "error" => $conn->error]);
        }
    } else {
        echo json_encode(["message" => "Invalid input"]);
    }
} else {
    echo json_encode(["message" => "Invalid request method"]);
}

$conn->close();
?>
