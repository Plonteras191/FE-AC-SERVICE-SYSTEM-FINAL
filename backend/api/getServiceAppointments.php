<?php
// getServiceAppointments.php

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require '../database.php'; // Adjust the path if needed

// Query the bookings table to return only accepted appointments
$sql = "SELECT id, services, status FROM bookings WHERE status = 'Accepted'";
$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "Database query failed"]);
    exit;
}

$serviceAppointments = [];

while ($row = $result->fetch_assoc()) {
    $bookingId = $row['id'];
    $services = json_decode($row['services'], true);
    // If the services field contains a valid array, iterate each service
    if (is_array($services)) {
        foreach ($services as $service) {
            // Check that required keys exist. If "time" is missing, default to an empty string.
            if (isset($service['type'], $service['date'])) {
                $serviceAppointments[] = [
                    "bookingId" => $bookingId,
                    "service"   => $service['type'],
                    "date"      => $service['date'],
                    "time"      => isset($service['time']) ? $service['time'] : "",
                    "status"    => $row['status']
                ];
            }
        }
    }
}

echo json_encode($serviceAppointments);
$conn->close();
?>