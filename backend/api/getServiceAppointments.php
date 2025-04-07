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

// Query the bookings table to return accepted appointments with customer name
$sql = "SELECT b.id, b.name, 
               GROUP_CONCAT(CONCAT(bs.service_type, ':', bs.appointment_date) SEPARATOR '|') AS services,
               b.status
        FROM bookings b
        LEFT JOIN booking_services bs ON b.id = bs.booking_id
        WHERE b.status = 'Accepted'
        GROUP BY b.id";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "Database query failed"]);
    exit;
}

$serviceAppointments = [];

while ($row = $result->fetch_assoc()) {
    $bookingId = $row['id'];
    $name = $row['name']; // Get customer's name
    $servicesStr = $row['services'];
    
    // Process each service in the concatenated string
    if (!empty($servicesStr)) {
        $services = explode('|', $servicesStr);
        foreach ($services as $service) {
            $parts = explode(':', $service);
            if (count($parts) === 2) {
                $serviceAppointments[] = [
                    "bookingId" => $bookingId,
                    "name"      => $name, // Include name in the output
                    "service"   => $parts[0],
                    "date"      => $parts[1],
                    "time"      => "", // Set default if time is not used
                    "status"    => $row['status']
                ];
            }
        }
    }
}

echo json_encode($serviceAppointments);
$conn->close();
?>
