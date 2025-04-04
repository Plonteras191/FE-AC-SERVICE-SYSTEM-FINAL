<?php
// appointments.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require '../database.php'; // Adjust the path if needed

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

// Handle preflight OPTIONS request
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method === 'GET') {
    // Fetch all appointments from the "bookings" table
    $sql = "SELECT * FROM bookings";
    $result = $conn->query($sql);
    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        $appointments[] = $row;
    }
    echo json_encode($appointments);
    exit;
}

// POST branch for accepting or completing an appointment
elseif ($method === 'POST' && isset($_GET['action']) && in_array($_GET['action'], ['accept', 'complete']) && $id) {
    // Determine new status based on the action
    $action = $_GET['action'];
    if ($action === 'accept') {
        $status = 'accepted';
    } elseif ($action === 'complete') {
        $status = 'completed';
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid action"]);
        exit;
    }
    
    $sql = "UPDATE bookings SET status='$status' WHERE id=$id";
    if ($conn->query($sql)) {
        // Fetch the updated appointment
        $result = $conn->query("SELECT * FROM bookings WHERE id=$id");
        if ($result) {
            $updatedAppointment = $result->fetch_assoc();
            echo json_encode($updatedAppointment);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to retrieve updated appointment: " . $conn->error]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update appointment: " . $conn->error]);
    }
    exit;
}

elseif ($method === 'PUT' && isset($_GET['action']) && $_GET['action'] === 'reschedule' && $id) {
    // Reschedule a service within an appointment.
    // Expect a JSON payload with "service_name" and "new_date".
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['service_name']) || !isset($data['new_date'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing service_name or new_date"]);
        exit;
    }
    
    $serviceName = $conn->real_escape_string($data['service_name']);
    $newDate = $conn->real_escape_string($data['new_date']);
    
    // Fetch the current appointment
    $sql = "SELECT * FROM bookings WHERE id = $id";
    $result = $conn->query($sql);
    if (!$result || $result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Appointment not found"]);
        exit;
    }
    $appointment = $result->fetch_assoc();
    
    // Decode the "services" field (JSON)
    $services = json_decode($appointment['services'], true);
    if (!is_array($services)) {
        http_response_code(500);
        echo json_encode(["error" => "Services data is corrupted"]);
        exit;
    }
    
    // Update the service's date that matches the provided service_name
    $updated = false;
    foreach ($services as &$service) {
        if ($service['type'] === $serviceName) {
            $service['date'] = $newDate;
            $updated = true;
        }
    }
    if (!$updated) {
        http_response_code(404);
        echo json_encode(["error" => "Service not found"]);
        exit;
    }
    
    // Re-encode the updated services array to JSON
    $newServicesJson = json_encode($services);
    
    // Update the appointment record with the new services JSON
    $updateSql = "UPDATE bookings SET services = '$newServicesJson' WHERE id = $id";
    if ($conn->query($updateSql)) {
        $result = $conn->query("SELECT * FROM bookings WHERE id = $id");
        $updatedAppointment = $result->fetch_assoc();
        echo json_encode($updatedAppointment);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update appointment: " . $conn->error]);
    }
    exit;
}

elseif ($method === 'DELETE' && $id) {
    // Reject (delete) an appointment
    $sql = "DELETE FROM bookings WHERE id = $id";
    if ($conn->query($sql)) {
        echo json_encode(["message" => "Appointment deleted"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to delete appointment: " . $conn->error]);
    }
    exit;
}

else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
?>
